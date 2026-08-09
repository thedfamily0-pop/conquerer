import { useEffect, useState } from 'react';
import { Book, Plus, Search, Trash2, X } from 'lucide-react';
import { loadVocab, saveVocab, createVocabWord, type VocabWord } from '../data/vocabData';

interface Props { isOpen: boolean; onClose: () => void; initialWord?: string; initialMeaning?: string; }

export function VocabBook({ isOpen, onClose, initialWord, initialMeaning }: Props) {
  const [words, setWords] = useState<VocabWord[]>(loadVocab);
  const [word, setWord] = useState(initialWord || '');
  const [meaning, setMeaning] = useState(initialMeaning || '');
  const [example, setExample] = useState('');
  const [language, setLanguage] = useState<VocabWord['language']>('english');
  const [filter, setFilter] = useState('');

  useEffect(() => { if (initialWord) setWord(initialWord); }, [initialWord]);
  useEffect(() => { if (initialMeaning) setMeaning(initialMeaning); }, [initialMeaning]);
  useEffect(() => { saveVocab(words); }, [words]);

  if (!isOpen) return null;

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = word.trim();
    if (!trimmed || !meaning.trim()) return;
    setWords(current => [createVocabWord(trimmed, meaning.trim(), example.trim() || undefined, language), ...current]);
    setWord(''); setMeaning(''); setExample('');
  };

  const remove = (id: string) => setWords(current => current.filter(w => w.id !== id));

  const filtered = filter ? words.filter(w => w.word.toLowerCase().includes(filter.toLowerCase()) || w.meaning.toLowerCase().includes(filter.toLowerCase())) : words;

  return (
    <div className="vocab-overlay" role="dialog" aria-modal="true" aria-label="Vocab Book">
      <div className="glass-card vocab-panel">
        <button className="icon-close" onClick={onClose} aria-label="Close vocab book"><X size={18}/></button>
        <header className="vocab-header">
          <Book size={26} color="#fbbf24"/>
          <div>
            <h2>My Vocab Book 📖</h2>
            <p className="muted">{words.length} word{words.length !== 1 ? 's' : ''} collected</p>
          </div>
        </header>

        <form className="vocab-add-form" onSubmit={add}>
          <input value={word} maxLength={60} onChange={e => setWord(e.target.value)} placeholder="New word" className="vocab-input" autoFocus/>
          <input value={meaning} maxLength={200} onChange={e => setMeaning(e.target.value)} placeholder="What it means" className="vocab-input"/>
          <input value={example} maxLength={200} onChange={e => setExample(e.target.value)} placeholder="Use it in a sentence (optional)" className="vocab-input"/>
          <div className="vocab-form-row">
            <select value={language} onChange={e => setLanguage(e.target.value as VocabWord['language'])} className="vocab-select">
              <option value="english">English 🇬🇧</option>
              <option value="afrikaans">Afrikaans 🇿🇦</option>
              <option value="zulu">isiZulu</option>
              <option value="other">Other</option>
            </select>
            <button className="btn-primary vocab-add-btn" type="submit" disabled={!word.trim() || !meaning.trim()}><Plus size={16}/>Add</button>
          </div>
        </form>

        {words.length > 3 && (
          <div className="vocab-search">
            <Search size={16}/>
            <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search my words…" className="vocab-input"/>
          </div>
        )}

        <div className="vocab-list">
          {filtered.length ? filtered.map(w => (
            <article className="vocab-card" key={w.id}>
              <div className="vocab-card-header">
                <b>{w.word}</b>
                <span className="vocab-lang">{w.language === 'english' ? '🇬🇧' : w.language === 'afrikaans' ? '🇿🇦' : w.language === 'zulu' ? '🇿🇦' : '🌍'}</span>
                <button onClick={() => remove(w.id)} aria-label={`Remove ${w.word}`} title="Remove word"><Trash2 size={14}/></button>
              </div>
              <p className="vocab-meaning">{w.meaning}</p>
              {w.example && <p className="vocab-example">"{w.example}"</p>}
            </article>
          )) : <p className="empty-state">{filter ? 'No matches found.' : 'Your vocab book is empty. Start adding words!'}</p>}
        </div>
      </div>
    </div>
  );
}
