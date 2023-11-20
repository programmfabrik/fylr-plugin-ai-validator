# https://datascience.stackexchange.com/questions/57191/is-there-a-good-german-stemmer:
# pip install HanTa numpy

import sys
import subprocess
import importlib
import os
import json
from pprint import pprint




neededModules = ["nltk", "HanTa", "numpy"]
for module in neededModules:
    needsImport = False

    try:
        importlib.import_module(module)
    except ImportError as e:
        print(e)
        needsImport = True

    if needsImport:
        # Install module.
        # Using os.system would be easier but that prints to stdout so that's why like this.
        print("installing " + module)
        command = "pip install --user " + module
        with open(os.devnull, 'w') as nullfile:
           subprocess.call(command, shell=True, stdout=nullfile, stderr=subprocess.STDOUT)




import nltk
nltk.download('punkt')  # don't ask me but doesn't work without this

from HanTa import HanoverTagger as ht




tagger_de = ht.HanoverTagger('morphmodel_ger.pgz')

text = "Das ist schon sehr schön mit den Expertinnen und Experten."
if len(sys.argv) > 1:
    text = sys.argv[1]


words = nltk.word_tokenize(text)
lemmata = tagger_de.tag_sent(words)
onlyStems = [item[1] for item in lemmata]
print(json.dumps(onlyStems))
