import { useState, useMemo, useCallback } from 'react';
import { Search as SearchIcon, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import {
  searchIndex,
  popularSearches,
  type SearchEntry,
  type SearchResultType,
} from '../data/searchIndex';

const TYPE_LABELS: Record<SearchResultType, string> = {
  Research: 'Research',
  Model: 'Product',
  Agent: 'Agent',
  Project: 'Project',
  Page: 'Page',
};

const TYPE_BADGE_COLORS: Record<SearchResultType, string> = {
  Research: 'bg-blue-50 text-blue-700',
  Model: 'bg-emerald-50 text-emerald-700',
  Agent: 'bg-purple-50 text-purple-700',
  Project: 'bg-amber-50 text-amber-700',
  Page: 'bg-gray-100 text-gray-600',
};

function scoreEntry(entry: SearchEntry, q: string): number {
  const query = q.toLowerCase();
  const title = entry.title.toLowerCase();
  const desc = entry.description.toLowerCase();
  const tags = (entry.tags ?? []).map((t) => t.toLowerCase());

  let score = 0;
  if (title === query) score += 100;
  if (title.includes(query)) score += 50;
  if (tags.some((t) => t === query)) score += 40;
  if (tags.some((t) => t.includes(query))) score += 20;
  if (desc.includes(query)) score += 10;
  return score;
}

function search(query: string): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const tokens = q.split(/\s+/).filter(Boolean);

  return searchIndex
    .map((entry) => {
      let score = 0;
      for (const token of tokens) {
        score += scoreEntry(entry, token);
      }
      return { entry, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.entry);
}

function highlight(text: string, query: string): React.ReactNode {
  const q = query.trim();
  if (!q) return text;
  const tokens = q.split(/\s+/).filter(Boolean).filter((t) => t.length >= 2);
  if (tokens.length === 0) return text;

  const escaped = tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(re);

  return parts.map((part, i) =>
    re.test(part) ? (
      <mark key={i} className="bg-yellow-100 rounded px-0.5">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

const Search = () => {
  const [query, setQuery] = useState('');

  const results = useMemo(() => search(query), [query]);

  const handleQuickSearch = useCallback((term: string) => {
    setQuery(term);
  }, []);

  return (
    <div className="container-custom py-24 min-h-[60vh]">
      <SEO
        title="Search"
        description="Search Tohnee.ai research, models, agents, and projects."
        path="/search"
      />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-medium mb-8">Search Tohnee.ai</h1>

        <div className="relative mb-16">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search research, models, agents, or projects..."
            className="w-full text-xl px-6 py-6 pl-14 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent shadow-sm"
            autoFocus
          />
          <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
        </div>

        {query.trim().length > 0 && (
          <div className="space-y-8">
            <div className="text-sm font-mono uppercase text-gray-500 tracking-widest mb-4">
              {results.length > 0
                ? `${results.length} Result${results.length > 1 ? 's' : ''}`
                : 'No Results'}
            </div>

            {results.length === 0 && (
              <p className="text-gray-500">
                No matches for "{query}". Try a different keyword or pick a popular search below.
              </p>
            )}

            {results.map((entry) => (
              <Link key={entry.url} to={entry.url} className="block group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-wider ${TYPE_BADGE_COLORS[entry.type]}`}
                      >
                        {TYPE_LABELS[entry.type]}
                      </span>
                      {entry.date && (
                        <span className="text-xs text-gray-400 font-mono">{entry.date}</span>
                      )}
                    </div>
                    <h3 className="text-xl font-medium mb-2 group-hover:underline">
                      {highlight(entry.title, query)}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2">
                      {highlight(entry.description, query)}
                    </p>
                  </div>
                  <ArrowUpRight
                    size={18}
                    className="text-gray-300 group-hover:text-black transition-colors flex-shrink-0 mt-1"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}

        {query.trim().length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-medium mb-4">Popular Searches</h3>
              <ul className="space-y-2 text-gray-600">
                {popularSearches.map((term) => (
                  <li key={term}>
                    <button
                      onClick={() => handleQuickSearch(term)}
                      className="text-left hover:text-black hover:underline cursor-pointer transition-colors"
                    >
                      {term}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Browse by Type</h3>
              <ul className="space-y-2 text-gray-600">
                {(['Research', 'Model', 'Agent', 'Project', 'Page'] as SearchResultType[]).map(
                  (type) => (
                    <li key={type}>
                      <button
                        onClick={() => handleQuickSearch(type)}
                        className="text-left hover:text-black hover:underline cursor-pointer transition-colors"
                      >
                        {TYPE_LABELS[type]}
                      </button>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
