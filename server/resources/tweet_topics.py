from nltk.corpus import brown, stopwords
import nltk
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.cluster import DBSCAN
import numpy as np
import re

stop_words = stopwords.words('english')

wordtags = nltk.ConditionalFreqDist((w.lower(), t) 
        for w, t in brown.tagged_words(tagset="universal"))
    
def preprocessSentence(sentence):
    new = sentence

    if(len(new) < 2):
        return

    #remove unnecessary RT info
    if new[0] == "R" and new[1] == "T":
        end_of_rt = new.find(':') + 2
        new = new[end_of_rt:]

    #remove filler words
    s = " "
    str_arr = new.split(s)
    str_arr_filtered = [x for x in str_arr if x not in stop_words and x[0:4] != "http"]

    #get rid of all this random /u stuff
    for string in str_arr_filtered:
        if string.find("/u") != -1:
            if string.find("/u") + 5 < len(string):
                rm_substring = string[string.find("/u"):string.find("/u") + 5]
            else:
                rm_substring = string[string.find("/u"):]
            string = string.replace(rm_substring, "")

    new = s.join(str_arr_filtered)
    #filter all other non word characters
    new = re.sub(r'([^\s\w]|_)+', '', new)

    #convert to only lowercase
    new = new.lower()

    return new


def getWordFreq(corpus, index):
    #accepts vectorized corpus and index of word 
    #that we want freq of
    #returns frequency of that word in the corpus
    freq = 0
    for sentence in corpus:
        freq = freq + sentence[index]
    
    return freq


def getBagOfWords(corpus):
    vectorizer = CountVectorizer()
    X = vectorizer.fit_transform(corpus)

    corpus_vector = X.toarray()
    corpus_words = vectorizer.get_feature_names()

    imp_word_indices = []
    imp_words = []
    for i, word in enumerate(corpus_words):
        #only want words that appear more than once total in the corpus
        #and nouns/verbs/adjectives to appear in our bag of words 
        if ('NOUN' in list(wordtags[word]) or 'VERB' in list(wordtags[word]) or 'ADJ' in list(wordtags[word])) and (getWordFreq(corpus_vector, i) > len(corpus)/10):
            imp_word_indices.append(i)
            imp_words.append(word)
            print(getWordFreq(corpus_vector, i))

    corpus_vector_new = []
    for sentence_vector in corpus_vector:
        corpus_vector_new.append(sentence_vector[imp_word_indices])
    
    corpus_vector_new = np.array(corpus_vector_new)

    return [corpus_vector_new, imp_words]

def runCluster(corpus_vector):
    #eps = The maximum distance between two samples for them to be considered as in the same neighborhood.
    #min_samples = number of samples (or total weight) in a neighborhood for a point to be considered as a core point
    #need this to be at least 10% of corpus to be considered a cluster
    clustering = DBSCAN(eps=1, min_samples=len(corpus_vec)/10).fit(corpus_vector)
    return clustering.labels_

def group_consecutives(vals, step=1):
    """Return list of consecutive lists of numbers from vals (number list)."""
    run = []
    result = [run]
    expect = None
    for v in vals:
        if (v == expect) or (expect is None):
            run.append(v)
        else:
            run = [v]
            result.append(run)
        expect = v + step
    return result

def extractKeyPhrases(index, document, corpus_vec, important_words):
    #get indices where vectorizer gives a non zero value
    key_words_indices = [i for i, x in enumerate(corpus_vec[index]) if x > 0]
    key_words = [x for i, x in enumerate(important_words) if i in key_words_indices ]

    word_arr = document[index].split(' ')
    key_word_positions = []
    for i, kw in enumerate(key_words):
        key_word_positions.append(word_arr.index(kw))
    
    key_word_positions.sort()
    consecutive_key_words = group_consecutives(key_word_positions)
    key_phrases = []
    for phrase_location in consecutive_key_words:
        phrase_arr = word_arr[phrase_location[0]:phrase_location[-1] + 1]
        key_phrase = ""
        for i, word in enumerate(phrase_arr):
            key_phrase = key_phrase + word
            if i != len(phrase_arr) - 1:
                key_phrase = key_phrase + " "
        
        key_phrases.append(key_phrase)
    
    print(key_phrases)
    
    return key_phrases
    
#print(list(wordtags['report']))
with open('text_samples/justin bieber_good.txt', 'r') as myfile:
    raw_text = myfile.read().replace('\n', '')

sentence_arr = raw_text.split(",,,")

document = []
for s in sentence_arr:
    newSentence = preprocessSentence(s)
    if isinstance(newSentence, str) and len(newSentence) > 0:
        document.append(preprocessSentence(s))

corpus_vec, important_words = getBagOfWords(document)

lbls = runCluster(corpus_vec)

for i in range(max(lbls) + 1):
    #first check if vector representing first tweet in the cluster is an all 0 vector
    #if so, diregard
    firstInd = lbls.tolist().index(i)
    if np.count_nonzero(corpus_vec[firstInd]) > 0:
        cluster_indices = [j for j, x in enumerate(lbls) if x == i]
        for cluster_ind in cluster_indices:
             extractKeyPhrases(cluster_ind, document, corpus_vec, important_words)



