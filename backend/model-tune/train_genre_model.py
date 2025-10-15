# ===============================================================
# MovieRazzi - Fine-tune DistilBERT for multi-label genre classification
# ===============================================================
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    Trainer,
    TrainingArguments
)
from datasets import Dataset
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.metrics import precision_recall_fscore_support
import pandas as pd
import numpy as np
import torch
import os

# ---------------------------------------------------------------
# GENRES
# ---------------------------------------------------------------
GENRES = [
    "action", "romance", "comedy", "drama", "thriller",
    "horror", "fantasy", "sci-fi", "animation", "adventure"
]

# ---------------------------------------------------------------
# 1. Load dataset
# ---------------------------------------------------------------
print("📂 Loading dataset...")
if not os.path.exists("genre_train.csv"):
    raise FileNotFoundError("❌ genre_train.csv not found in this folder!")

df = pd.read_csv("genre_train.csv")
df["labels"] = df["labels"].apply(lambda x: [g.strip() for g in x.split(",")])

mlb = MultiLabelBinarizer(classes=GENRES)
y = mlb.fit_transform(df["labels"])
dataset = Dataset.from_dict({"text": df["text"].tolist(), "labels": y.tolist()})
dataset = dataset.train_test_split(test_size=0.2, seed=42)

# ---------------------------------------------------------------
# 2. Tokenizer
# ---------------------------------------------------------------
model_name = "distilbert-base-uncased"
tokenizer = AutoTokenizer.from_pretrained(model_name)

def preprocess(batch):
    tokens = tokenizer(batch["text"], truncation=True, padding="max_length", max_length=128)
    tokens["labels"] = [np.array(l, dtype=np.float32) for l in batch["labels"]]
    return tokens

dataset = dataset.map(preprocess, batched=True, remove_columns=["text"])
dataset.set_format(type="torch", columns=["input_ids", "attention_mask", "labels"])

# ---------------------------------------------------------------
# 3. Model
# ---------------------------------------------------------------
print("⚙️ Loading model...")
model = AutoModelForSequenceClassification.from_pretrained(
    model_name,
    num_labels=len(GENRES),
    problem_type="multi_label_classification"
)

# ---------------------------------------------------------------
# 4. Custom Trainer (forces float labels)
# ---------------------------------------------------------------
class FloatTrainer(Trainer):
    def compute_loss(self, model, inputs, return_outputs=False, num_items_in_batch=None):
        labels = inputs.pop("labels")
        labels = labels.to(torch.float32)            # ✅ ensure float32 labels
        outputs = model(**inputs)
        logits = outputs.logits
        loss_fct = torch.nn.BCEWithLogitsLoss()
        loss = loss_fct(logits, labels)
        return (loss, outputs) if return_outputs else loss

# ---------------------------------------------------------------
# 5. Metrics
# ---------------------------------------------------------------
def compute_metrics(pred):
    logits, labels = pred
    probs = 1 / (1 + np.exp(-logits))
    preds = (probs >= 0.5).astype(int)
    p, r, f1, _ = precision_recall_fscore_support(labels, preds, average="micro", zero_division=0)
    return {"precision": p, "recall": r, "f1": f1}

# ---------------------------------------------------------------
# 6. Training args
# ---------------------------------------------------------------
training_args = TrainingArguments(
    output_dir="./genre_model",
    eval_strategy="epoch",
    save_strategy="epoch",
    learning_rate=3e-5,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    num_train_epochs=3,
    weight_decay=0.01,
    logging_dir="./logs",
    load_best_model_at_end=True,
    metric_for_best_model="f1",
    report_to="none",
    fp16=torch.cuda.is_available()
)

# ---------------------------------------------------------------
# 7. Trainer + Train
# ---------------------------------------------------------------
trainer = FloatTrainer(
    model=model,
    args=training_args,
    train_dataset=dataset["train"],
    eval_dataset=dataset["test"],
    tokenizer=tokenizer,
    compute_metrics=compute_metrics
)

print("🚀 Starting fine-tuning...")
trainer.train()

# ---------------------------------------------------------------
# 8. Save
# ---------------------------------------------------------------
print("💾 Saving fine-tuned model...")
trainer.save_model("./genre_model")
tokenizer.save_pretrained("./genre_model")
print("\n✅ Training completed successfully!")
