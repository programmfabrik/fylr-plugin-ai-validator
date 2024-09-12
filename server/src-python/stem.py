import sys
import subprocess
import importlib
import os
import json
from pprint import pprint

# Verzeichnis des aktuellen Skripts
script_directory = os.path.dirname(os.path.abspath(__file__))
# Verzeichnis der entpackten Bibliotheken
library_dir = os.path.join(script_directory, 'hanta_numpy_nltk/unpacked')

# Füge das Verzeichnis zu sys.path hinzu
sys.path.append(library_dir)

# Debug: Ausgabe des sys.path
#sys.stderr.write(f"sys.path: {sys.path}\n")

# Füge das Verzeichnis der Regex-Bibliothek zu sys.path hinzu
regex_dir = os.path.join(library_dir, 'regex')
if os.path.isdir(regex_dir):
    sys.path.insert(0, regex_dir)

from HanTa import HanoverTagger as ht
import nltk
import numpy

# NLTK Daten herunterladen, falls benötigt
nltk.data.path.append(library_dir)
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    sys.stderr.write("NLTK punkt tokenizer not found. Downloading...\n")
    nltk.download('punkt', download_dir=library_dir)

# Tagger initialisieren
tagger_de = ht.HanoverTagger('morphmodel_ger.pgz')
text = "Das ist schon sehr schön mit den Expertinnen und Experten."
if len(sys.argv) > 1:
    text = sys.argv[1]

# Tokenisiere und tagge den Text
#sys.stderr.write(f"Tokenizing text: {text}\n")
words = nltk.word_tokenize(text)
#sys.stderr.write(f"Tokenized words: {words}\n")

#sys.stderr.write(f"Tagging words...\n")
lemmata = tagger_de.tag_sent(words)
#sys.stderr.write(f"Lemmatized output: {lemmata}\n")

onlyStems = [item[1] for item in lemmata]
#sys.stderr.write(f"Only stems: {onlyStems}\n")

print(json.dumps(onlyStems))
