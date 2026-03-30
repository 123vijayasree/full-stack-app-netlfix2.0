import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import './App.css';
import './SplashPage.css';


const API = 'http://localhost:5000/api';
const OMDB_KEY = '1f4358c';
 const YT_KEY = "AIzaSyBsTlkB1FmA5hauoPt7lFqCafL0SBstbZs";

const HERO_MOVIES = [
  { title: 'Avengers: Endgame', desc: 'The epic conclusion to the Infinity Saga.', img: 'https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg' },
  { title: 'KGF Chapter 2', desc: "Rocky's empire faces new threats.", img: 'https://resize.indiatvnews.com/en/resize/newbucket/355_-/2020/08/kgf-chapter-2-1576932714-1598445478.jpg' },
  { title: 'RRR', desc: 'Two legendary revolutionaries journey.', img: 'https://upload.wikimedia.org/wikipedia/en/d/d7/RRR_Poster.jpg' },
  { title: 'Pushpa', desc: 'A laborer rises in smuggling syndicate.', img: 'https://www.bollywoodhungama.com/wp-content/uploads/2021/01/Pushpa-banner.jpg' },
];

const PLANS = [
  { name: 'Mobile', price: '₹149/mo', quality: 'Good', screens: 1, resolution: '480p', color: '#e50914' },
  { name: 'Basic', price: '₹199/mo', quality: 'Good', screens: 1, resolution: '720p', color: '#f5a623' },
  { name: 'Standard', price: '₹499/mo', quality: 'Great', screens: 2, resolution: '1080p', color: '#4a90e2' },
  { name: 'Premium', price: '₹649/mo', quality: 'Best 4K', screens: 4, resolution: '4K+HDR', color: '#7b68ee' },
];

const YEARS = Array.from({ length: 27 }, (_, i) => 2000 + i).reverse();

const CATEGORIES = {
  popular: [
    { label: '🔥 Popular', keyword: 'popular' },
    { label: '🏆 Blockbuster', keyword: 'blockbuster' },
    { label: '💎 Underrated', keyword: 'underrated' },
    { label: '🌟 Hollywood', keyword: 'Hollywood' },
    { label: '🦸 Marvel', keyword: 'Marvel' },
    { label: '🎬 Tamil', keyword: 'Tamil' },
    { label: '🎥 Hindi', keyword: 'Bollywood' },
    { label: '🎞 Telugu', keyword: 'Telugu' },
  ],
  tvshows: [
    { label: '📺 Popular Shows', keyword: 'popular TV series' },
    { label: '🔍 Crime Drama', keyword: 'crime drama series' },
    { label: '😂 Comedy Shows', keyword: 'comedy TV show' },
    { label: '🧟 Sci-Fi Series', keyword: 'sci-fi series' },
  ],
  podcasts: [
    { label: '🎙 True Crime', keyword: 'true crime documentary' },
    { label: '🎤 Comedy', keyword: 'stand up comedy' },
    { label: '📖 Story Time', keyword: 'story based film' },
    { label: '🧠 Mind Bending', keyword: 'mind bending thriller' },
  ],
  languages: [
    { label: '🇮🇳 Tamil', keyword: 'Tamil' },
    { label: '🇮🇳 Hindi', keyword: 'Hindi' },
    { label: '🇮🇳 Telugu', keyword: 'Telugu' },
    { label: '🇮🇳 Malayalam', keyword: 'Malayalam' },
    { label: '🇮🇳 Kannada', keyword: 'Kannada' },
    { label: '🇺🇸 English', keyword: 'English' },
    { label: '🇰🇷 Korean', keyword: 'Korean' },
    { label: '🇯🇵 Japanese', keyword: 'Japanese anime' },
    { label: '🇪🇸 Spanish', keyword: 'Spanish' },
    { label: '🇫🇷 French', keyword: 'French' },
    { label: '🇩🇪 German', keyword: 'German' },
    { label: '🇮🇹 Italian', keyword: 'Italian' },
  ],
};

export default function App() {
  const [page, setPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [categoryMovies, setCategoryMovies] = useState({});
  const [favourites, setFavourites] = useState([]);
  const [tab, setTab] = useState('home');
  const [message, setMessage] = useState('');
  const [heroIndex, setHeroIndex] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [movieDetail, setMovieDetail] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [activeLang, setActiveLang] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [showSplash, setShowSplash] = useState(true);
  const searchRef = useRef(null);




  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser({ email: u.email, name: u.displayName, photo: u.photoURL });
        setPage('subscription');
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setHeroIndex(p => (p + 1) % HERO_MOVIES.length), 5000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (page === 'home') { fetchFavourites(); loadCategories(); }
  }, [page]);

  const showToast = (msg) => { setMessage(msg); setTimeout(() => setMessage(''), 3000); };

  const loadCategories = async () => {
    setLoading(true);
    const results = {};
    for (const cat of CATEGORIES.popular) {
      try {
        const res = await axios.get(`http://www.omdbapi.com/?s=${encodeURIComponent(cat.keyword)}&type=movie&apikey=${OMDB_KEY}`);
        if (res.data.Search) results[cat.label] = res.data.Search;
      } catch (e) {}
    }
    setCategoryMovies(results);
    setLoading(false);
  };

  const loadTabCategories = async (tabCats) => {
    setLoading(true);
    const results = {};
    for (const cat of tabCats) {
      try {
        const res = await axios.get(`http://www.omdbapi.com/?s=${encodeURIComponent(cat.keyword)}&apikey=${OMDB_KEY}`);
        if (res.data.Search) results[cat.label] = res.data.Search;
      } catch (e) {}
    }
    setCategoryMovies(results);
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const u = result.user;
      setUser({ email: u.email, name: u.displayName, photo: u.photoURL });
      setPage('subscription');
    } catch { showToast('Google login failed!'); }
  };

  const handleLogin = () => {
    if (!email || !password) { showToast('Enter email and password!'); return; }
    setUser({ email, name: email.split('@')[0], photo: null });
    setPage('subscription');
  };

  const handleSubscribe = (plan) => {
    setSelectedPlan(plan);
    showToast(`✅ Subscribed to ${plan.name} plan!`);
    setTimeout(() => setPage('home'), 2000);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
    setPage('landing');
    setCategoryMovies({});
    setSearchResults([]);
  };

  const searchMovies = async (customQuery) => {
    const q = customQuery || query;
    if (!q.trim()) return;
    try {
      const yearParam = selectedYear ? `&y=${selectedYear}` : '';
      const res = await axios.get(`http://www.omdbapi.com/?s=${encodeURIComponent(q)}${yearParam}&apikey=${OMDB_KEY}`);
      setSearchResults(res.data.Search || []);
      setTab('search');
      setShowSearch(false);
      if (!res.data.Search) showToast('No movies found!');
    } catch { showToast('Search failed!'); }
  };

  const fetchMovieDetail = async (imdbID) => {
    try {
      const res = await axios.get(`http://www.omdbapi.com/?i=${imdbID}&apikey=${OMDB_KEY}`);
      setMovieDetail(res.data);
    } catch {}
  };

  const fetchFavourites = async () => {
    try { const res = await axios.get(`${API}/favourites`); setFavourites(res.data); } catch {}
  };

  const addFavourite = async (movie) => {
    try {
      const res = await axios.post(`${API}/favourites`, { imdbID: movie.imdbID, Title: movie.Title, Year: movie.Year, Poster: movie.Poster });
      showToast(res.data.message || '❤️ Added to My List!');
      fetchFavourites();
    } catch { showToast('Error!'); }
  };

  const removeFavourite = async (id) => {
    await axios.delete(`${API}/favourites/${id}`);
    fetchFavourites();
    showToast('🗑️ Removed!');
  };

  const isFav = (imdbID) => favourites.some(f => f.imdbID === imdbID);

  const handleTabChange = (t) => {
    setTab(t);
    if (t === 'tvshows') loadTabCategories(CATEGORIES.tvshows);
    else if (t === 'podcasts') loadTabCategories(CATEGORIES.podcasts);
    else if (t === 'home') loadCategories();
    else if (t === 'languages') setCategoryMovies({});
  };

  const handleLangClick = async (lang) => {
    setActiveLang(lang.label);
    setLoading(true);
    try {
      const res = await axios.get(`http://www.omdbapi.com/?s=${encodeURIComponent(lang.keyword)}&apikey=${OMDB_KEY}`);
      setSearchResults(res.data.Search || []);
      setTab('search');
      setQuery(lang.label);
    } catch {}
    setLoading(false);
  };

const playTrailer = async (title) => {
  try {
    const res = await axios.get(
      `https://www.googleapis.com/youtube/v3/search`,
      {
        params: {
          part: "snippet",
          q: title + " official trailer",
          key: YT_KEY,
          maxResults: 1,
          type: "video"
        }
      }
    );

    const videoId = res.data.items[0].id.videoId;

    setTrailerUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1`);
  } catch (err) {
    console.log(err);
  }
};
useEffect(() => {
  const timer = setTimeout(() => setShowSplash(false), 2000); // 0.12s
  return () => clearTimeout(timer);
}, []);

  // MOVIE ROW
  const MovieRow = ({ title, movies }) => {
    if (!movies || movies.length === 0) return null;
    return (
      <div className="movie-row">
        <h3 className="row-title">{title}</h3>
        <div className="row-scroll">
          {movies.map(movie => (
            <div key={movie.imdbID} className="row-card" onClick={() => fetchMovieDetail(movie.imdbID)}>
              <img src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/150x220?text=No+Image'} alt={movie.Title} />
              <div className="row-card-overlay">
                <h4>{movie.Title}</h4>
                <p className="row-year">{movie.Year}</p>
                <div className="row-card-btns">
                <button
                className="play-small"
                onClick={(e) => {
                  e.stopPropagation();
                  playTrailer(movie.Title);
                 }}
                >
                 ▶
                </button>
                  <button className="add-small" onClick={e => { e.stopPropagation(); addFavourite(movie); }} title="Add to My List">
                    {isFav(movie.imdbID) ? '✓' : '+'}
                  </button>
                  <button className="info-small" onClick={e => { e.stopPropagation(); fetchMovieDetail(movie.imdbID); }} title="More Info">ℹ</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // MOVIE MODAL
  const Modal = () => {
    if (!movieDetail) return null;
    return (
      <div className="modal-overlay" onClick={() => setMovieDetail(null)}>
        <div className="modal-box" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={() => setMovieDetail(null)}>✕</button>
          <div className="modal-hero" style={{ backgroundImage: `url(${movieDetail.Poster !== 'N/A' ? movieDetail.Poster : ''})` }}>
            <div className="modal-hero-overlay" />
            <div className="modal-hero-content">
              <p className="hero-tag">N SERIES</p>
              <h2>{movieDetail.Title}</h2>
              <div className="modal-btns">
                <button className="play-btn" onClick={() => { playTrailer(movieDetail.Title); setMovieDetail(null); }}>▶ Play Trailer</button>
                <button className="mlist-btn" onClick={() => addFavourite(movieDetail)}>
                  {isFav(movieDetail.imdbID) ? '✓ In My List' : '+ My List'}
                </button>
              </div>
            </div>
          </div>
          <div className="modal-body">
            <div className="modal-left">
              <div className="modal-meta">
                <span className="match">⭐ {movieDetail.imdbRating}/10</span>
                <span className="year-badge">{movieDetail.Year}</span>
                <span className="rated">{movieDetail.Rated}</span>
                <span className="runtime">{movieDetail.Runtime}</span>
              </div>
              <p className="modal-plot">{movieDetail.Plot}</p>
            </div>
            <div className="modal-right">
              <p><span className="label">Cast: </span>{movieDetail.Actors}</p>
              <p><span className="label">Genre: </span>{movieDetail.Genre}</p>
              <p><span className="label">Director: </span>{movieDetail.Director}</p>
              <p><span className="label">Language: </span>{movieDetail.Language}</p>
              <p><span className="label">Awards: </span>{movieDetail.Awards}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════
  //  LANDING PAGE
  // ══════════════════════════
  if (showSplash) {
  return (
    <div
      className="splash-page"
      style={{
        backgroundImage: 'url("https://flixnet.epizy.com/wp-content/uploads/2023/03/IN-en-20230320-popsignuptwoweeks-perspective_alpha_website_medium-3.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'rgb(204, 43, 43)',
        fontFamily: '"Bebas Neue", Arial, sans-serif',
        fontWeight: 'bold',
        textShadow: '2px 2px 8px rgba(0,0,0,0.7)',
      }}
    >
      <h1 style={{ fontSize: '10rem' }}>NETFLIX 2.0</h1>
      <p style={{ fontSize: '2.5rem' }}>Loading...</p>
    </div>
  );
}
  if (page === 'landing') {
    return (
      <div
  className="landing-page"
  style={{
    backgroundImage: `url("https://flixnet.epizy.com/wp-content/uploads/2023/03/IN-en-20230320-popsignuptwoweeks-perspective_alpha_website_medium-3.jpg")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }}
> 
        <div className="landing-overlay" />
        <div className="landing-navbar">
          <h1 className="logo">NETFLIX 2.0</h1>
          <button className="signin-small" onClick={() => setPage('login')}>Sign In</button>
        </div>
        <div className="landing-content fade-in">
          <h2>Unlimited movies,<br />TV shows and more</h2>
          <p>Watch anywhere. Cancel anytime.</p>
          <p className="ready-text">Ready to watch? Click below to get started.</p>
          <button className="get-started-btn" onClick={() => setPage('login')}>
            Get Started →
          </button>
        </div>
        <div className="landing-features">
          {[
            { icon: '📺', title: 'Watch on any device', desc: 'TV, phone, tablet or laptop' },
            { icon: '🎬', title: 'All Languages', desc: 'Tamil, Hindi, Korean & more' },
            { icon: '📅', title: '2000 - 2026', desc: 'Latest & classic movies' },
            { icon: '🔄', title: 'Cancel anytime', desc: 'No contracts, join today' },
          ].map(f => (
            <div key={f.title} className="feature-card">
              <span>{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="landing-footer">
          <p>🎬 NETFLIX 2.0 © 2024 | Powered by OMDb API</p>
        </div>
      </div>
    );
  }

  // ══════════════════════════
  //  LOGIN PAGE
  // ══════════════════════════
  if (page === 'login') {
    return (
      <div className="login-page"
     style={{
    backgroundImage: `url("https://flixnet.epizy.com/wp-content/uploads/2023/03/IN-en-20230320-popsignuptwoweeks-perspective_alpha_website_medium-3.jpg")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }}
>
        <div className="login-overlay" />
        <div className="login-navbar">
          <h1 className="logo" onClick={() => setPage('landing')}>NETFLIX 2.0</h1>
        </div>
        <div className="login-box slide-up">
          <h2>Sign In</h2>
          <button className="google-btn" onClick={handleGoogleLogin}>
            <img src="https://www.google.com/favicon.ico" alt="G" width="20" />
            Sign in with Google
          </button>
          <div className="divider"><span>OR</span></div>
          <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          <button className="signin-btn" onClick={handleLogin}>Sign In</button>
          {message && <p className="login-error">{message}</p>}
          <div className="login-options">
            <label><input type="checkbox" /> Remember me</label>
            <span className="link">Need help?</span>
          </div>
          <p className="login-footer">New to Netflix 2.0?{' '}<span className="link" onClick={() => setPage('subscription')}>Sign up now</span></p>
        </div>
      </div>
    );
  }


  // ══════════════════════════
  //  SUBSCRIPTION PAGE
  // ══════════════════════════
  if (page === 'subscription') {
    return (
      <div className="sub-page">
        <div className="login-overlay" />
        <div className="login-navbar">
          <h1 className="logo">NETFLIX 2.0</h1>
          <button className="skip-btn" onClick={() => setPage('home')}>Skip →</button>
        </div>
        <div className="sub-content">
          <div className="sub-steps"><span>STEP <b>1</b> OF <b>3</b></span></div>
          <h2>Choose the plan that's right for you</h2>
          <div className="plan-features-header">
            <span></span>
            {PLANS.map(p => <div key={p.name} className="plan-name-header" style={{ color: p.color }}>{p.name}</div>)}
          </div>
          <div className="plan-table">
            {[['Monthly Price', 'price'], ['Video Quality', 'quality'], ['Resolution', 'resolution'], ['Screens', 'screens']].map(([label, key]) => (
              <div className="plan-row" key={key}>
                <span>{label}</span>
                {PLANS.map(p => <div key={p.name}>{p[key]}</div>)}
              </div>
            ))}
          </div>
          <div className="plans-grid">
            {PLANS.map(plan => (
              <div key={plan.name} className="plan-card" style={{ borderColor: plan.color }}>
                <div className="plan-header" style={{ background: plan.color }}><h3>{plan.name}</h3></div>
                <div className="plan-body">
                  <p className="plan-price">{plan.price}</p>
                  <p>📺 {plan.quality}</p>
                  <p>🖥️ {plan.resolution}</p>
                  <p>👥 {plan.screens} Screen{plan.screens > 1 ? 's' : ''}</p>
                  <button className="plan-btn" style={{ background: plan.color }} onClick={() => handleSubscribe(plan)}>Subscribe</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {message && <div className="toast">{message}</div>}
      </div>
    );
  }

  // ══════════════════════════
  //  HOME PAGE
  // ══════════════════════════
  return (
    <div className="app">
      {/* NAVBAR */}
      <div className={`navbar ${navScrolled ? 'scrolled' : ''}`}>
        <div className="nav-left">
          <h1 className="logo" onClick={() => handleTabChange('home')}>NETFLIX 2.0</h1>
          <div className="nav-links">
            <span className={tab === 'home' ? 'active' : ''} onClick={() => handleTabChange('home')}>Home</span>
            <span className={tab === 'tvshows' ? 'active' : ''} onClick={() => handleTabChange('tvshows')}>TV Shows</span>
            <span className={tab === 'movies' ? 'active' : ''} onClick={() => handleTabChange('movies')}>Movies</span>
            <span className={tab === 'podcasts' ? 'active' : ''} onClick={() => handleTabChange('podcasts')}>Podcasts</span>
            <span className={tab === 'languages' ? 'active' : ''} onClick={() => handleTabChange('languages')}>🌍 Languages</span>
            <span className={tab === 'mylist' ? 'active' : ''} onClick={() => handleTabChange('mylist')}>My List</span>
          </div>
        </div>
        <div className="nav-right">
          {showSearch ? (
            <div className="search-box-nav">
              <input ref={searchRef} type="text" placeholder="Search movies..." value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchMovies()} autoFocus />
              <select className="year-select" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                <option value="">All Years</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <button onClick={() => searchMovies()}>🔍</button>
              <button onClick={() => setShowSearch(false)}>✕</button>
            </div>
          ) : (
            <span className="nav-icon" onClick={() => setShowSearch(true)}>🔍</span>
          )}
          {selectedPlan && <span className="plan-badge" style={{ background: selectedPlan.color }}>{selectedPlan.name}</span>}
          <span className="nav-icon">🔔</span>
          <div className="user-menu">
            {user?.photo ? <img src={user.photo} alt="avatar" className="avatar-img" /> : <span className="avatar">👤</span>}
            <span className="user-email">{user?.name || user?.email?.split('@')[0]}</span>
            <div className="dropdown">
              <p>{user?.email}</p>
              {selectedPlan && <p>Plan: {selectedPlan.name}</p>}
              <hr />
              <span onClick={() => setPage('subscription')}>Change Plan</span>
              <span onClick={handleSignOut}>Sign Out</span>
            </div>
          </div>
        </div>
      </div>

      {/* HERO BANNER */}
      {tab === 'home' && (
        <div className="hero-banner" style={{ backgroundImage: `url(${HERO_MOVIES[heroIndex].img})` }}>
          <div className="hero-gradient" />
          <div className="hero-content">
            <p className="hero-tag">N SERIES</p>
            <h2 className="hero-title">{HERO_MOVIES[heroIndex].title}</h2>
            <p className="hero-desc">{HERO_MOVIES[heroIndex].desc}</p>
            <div className="hero-btns">
              <button 
              className="play-btn" 
                onClick={() => playTrailer(HERO_MOVIES[heroIndex].title)}
              >
              ▶ Watch
             </button>
              <button className="info-btn" onClick={() => fetchMovieDetail('tt4154796')}>ℹ More Info</button>
            </div>
          </div>
          <div className="hero-dots">
            {HERO_MOVIES.map((_, i) => (
              <span key={i} className={`dot ${i === heroIndex ? 'active' : ''}`} onClick={() => setHeroIndex(i)} />
            ))}
          </div>
        </div>
      )}

      {/* CONTENT */}
      <div className="content-area">

        {/* YEAR FILTER BAR */}
        {(tab === 'home' || tab === 'movies') && (
          <div className="year-filter-bar">
            <span className="year-filter-label">📅 Filter by Year:</span>
            <div className="year-scroll">
              <button className={`year-btn ${selectedYear === '' ? 'active' : ''}`} onClick={() => { setSelectedYear(''); }}>All</button>
              {YEARS.map(y => (
                <button key={y} className={`year-btn ${selectedYear === String(y) ? 'active' : ''}`}
                  onClick={() => { setSelectedYear(String(y)); searchMovies(tab === 'movies' ? 'movie' : 'popular'); }}>
                  {y}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* HOME / TV SHOWS / PODCASTS ROWS */}
        {(tab === 'home' || tab === 'tvshows' || tab === 'podcasts') && (
          loading ? (
            <div className="loading"><div className="spinner" /><p>Loading...</p></div>
          ) : (
            Object.entries(categoryMovies).map(([title, movies]) => (
              <MovieRow key={title} title={title} movies={movies} />
            ))
          )
        )}

        {/* MOVIES TAB */}
        {tab === 'movies' && (
          <div className="section">
            <div className="section-title">🎥 Browse by Category</div>
            <div className="lang-filter">
              {CATEGORIES.popular.map(cat => (
                <button key={cat.label} className="lang-btn" onClick={async () => {
                  const yearParam = selectedYear ? `&y=${selectedYear}` : '';
                  const res = await axios.get(`http://www.omdbapi.com/?s=${encodeURIComponent(cat.keyword)}${yearParam}&apikey=${OMDB_KEY}`);
                  if (res.data.Search) { setSearchResults(res.data.Search); setTab('search'); setQuery(cat.label); }
                }}>{cat.label}</button>
              ))}
            </div>
          </div>
        )}

        {/* LANGUAGES TAB */}
        {tab === 'languages' && (
          <div className="section">
            <div className="section-title">🌍 Browse by Language</div>
            <div className="year-filter-bar">
              <span className="year-filter-label">📅 Year:</span>
              <div className="year-scroll">
                <button className={`year-btn ${selectedYear === '' ? 'active' : ''}`} onClick={() => setSelectedYear('')}>All</button>
                {YEARS.map(y => (
                  <button key={y} className={`year-btn ${selectedYear === String(y) ? 'active' : ''}`} onClick={() => setSelectedYear(String(y))}>{y}</button>
                ))}
              </div>
            </div>
            <div className="lang-filter" style={{ marginTop: '20px' }}>
              {CATEGORIES.languages.map(lang => (
                <button key={lang.label} className={`lang-btn ${activeLang === lang.label ? 'active' : ''}`}
                  onClick={() => handleLangClick(lang)}>{lang.label}</button>
              ))}
            </div>
          </div>
        )}

        {/* SEARCH RESULTS */}
        {tab === 'search' && (
          <div className="section">
            <div className="section-title">🔍 Results for "{query}" {selectedYear && `(${selectedYear})`}</div>
            <div className="movies-grid">
              {searchResults.map(movie => (
                <div key={movie.imdbID} className="movie-card">
                  <div className="movie-poster-wrap">
                    <img src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/180x260?text=No+Image'} alt={movie.Title} />
                    <div className="movie-poster-overlay">
                      <button className="overlay-play" onClick={() => playTrailer(movie.Title)}>▶</button>
                      <button className="overlay-info" onClick={() => fetchMovieDetail(movie.imdbID)}>ℹ</button>
                    </div>
                  </div>
                  <div className="movie-info">
                    <h3>{movie.Title}</h3>
                    <p>📅 {movie.Year}</p>
                    <button onClick={e => { e.stopPropagation(); addFavourite(movie); }}>
                      {isFav(movie.imdbID) ? '✓ In My List' : '+ My List'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MY LIST */}
        {tab === 'mylist' && (
          <div className="section">
            <div className="section-title">❤️ My List</div>
            {favourites.length === 0 ? (
              <div className="empty">No movies yet! Browse and add movies 🎬</div>
            ) : (
              <div className="movies-grid">
                {favourites.map(movie => (
                  <div key={movie._id} className="movie-card">
                    <div className="movie-poster-wrap">
                      <img src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/180x260?text=No+Image'} alt={movie.Title} />
                      <div className="movie-poster-overlay">
                        <button className="overlay-play" onClick={() => playTrailer(movie.Title)}>▶</button>
                        <button className="overlay-info" onClick={() => fetchMovieDetail(movie.imdbID)}>ℹ</button>
                      </div>
                    </div>
                    <div className="movie-info">
                      <h3>{movie.Title}</h3>
                      <p>📅 {movie.Year}</p>
                      <button className="remove" onClick={() => removeFavourite(movie._id)}>🗑️ Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="footer">
        <div className="footer-links">
          {['FAQ', 'Help Centre', 'Account', 'Media Centre', 'Jobs', 'Privacy', 'Terms of Use', 'Contact Us'].map(l => (
            <span key={l}>{l}</span>
          ))}
        </div>
        <p>🎬 NETFLIX 2.0 © 2024 | Powered by OMDb API | Made with ❤️</p>
      </div>

      {movieDetail && <Modal />}

      {trailerUrl && (
        <div className="modal-overlay" onClick={() => setTrailerUrl(null)}>
          <div className="trailer-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setTrailerUrl(null)}>✕</button>
          <iframe
        width="100%"
        height="100%"
        src={trailerUrl}
        title="Trailer"
        frameBorder="0"
        allow="autoplay; encrypted-media"
        allowFullScreen
      />
          </div>
        </div>
      )}

      {message && <div className="toast">{message}</div>}
    </div>
  );
}