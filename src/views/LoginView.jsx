import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { 
  Terminal, 
  ShieldAlert, 
  Fingerprint,
  Lock,
  User,
  AlertTriangle
} from 'lucide-react';
import { auth, db } from '../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  deleteUser 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  runTransaction 
} from 'firebase/firestore';

const AVATARS = ['🕶️', '🏍️', '👑', '🕵️‍♂️', '🦾', '😈', '💼'];

const FACTION_OPTIONS = [
  { id: 'riderz', name: 'Demon Riderz', perks: '+10 Starting Demon Riderz Standing', color: 'var(--accent-pink)', desc: 'Rebellious biker gang ruling smuggling lanes.' },
  { id: 'people', name: 'The People', perks: '+10 Starting The People Standing', color: 'var(--accent-green)', desc: 'Loyal street syndicate with unmatched numbers.' },
  { id: 'firm', name: 'The Firm', perks: '+10 Starting The Firm Standing', color: 'var(--accent-gold)', desc: 'Corporate, cold mob operations laundering millions.' }
];

export default function LoginView({ onLoginComplete }) {
  const { 
    setUsername, 
    setCharacterAvatar,
    setFactions,
    startTutorial
  } = useGame();

  const [isSignUp, setIsSignUp] = useState(false);
  const [usernameInput, setUsernameInput] = useState('StreetThug_77');
  const [passwordInput, setPasswordInput] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🕶️');
  const [selectedFaction, setSelectedFaction] = useState('people');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    const trimmedUsername = usernameInput.trim();
    if (!trimmedUsername) {
      setError('UPLINK ERROR: Username is required.');
      return;
    }
    if (!passwordInput) {
      setError('UPLINK ERROR: Secure passcode decryption key is required.');
      return;
    }

    setError('');
    setLoading(true);

    const email = `${trimmedUsername.toLowerCase().replace(/\s+/g, '_')}@metrocity.underworld`;

    try {
      if (isSignUp) {
        // --- 1. SIGNUP: Create Firebase Auth account ---
        let userCredential;
        try {
          userCredential = await createUserWithEmailAndPassword(auth, email, passwordInput);
        } catch (authError) {
          if (authError.code === 'auth/email-already-in-use') {
            throw new Error("CONNECTION REJECTED: Mainframe link already established for this username.");
          } else if (authError.code === 'auth/weak-password') {
            throw new Error("SECURITY FAILURE: Passcode strength index below underworld safety threshold.");
          } else if (authError.code === 'auth/invalid-email') {
            throw new Error("UPLINK ERROR: Username formatting is incompatible with decryption nodes.");
          } else {
            throw new Error(`UPLINK ERROR: Gateway connection failed. Code: ${authError.code}`);
          }
        }

        const user = userCredential.user;

        // --- 2. SIGNUP: Atomic Firestore Transaction to reserve username ---
        try {
          const usernameRef = doc(db, 'usernames', trimmedUsername);
          await runTransaction(db, async (transaction) => {
            const usernameSnap = await transaction.get(usernameRef);
            if (usernameSnap.exists()) {
              throw new Error("Alias already claimed by another syndicate boss.");
            }
            transaction.set(usernameRef, { 
              ownerUid: user.uid, 
              createdAt: new Date().toISOString() 
            });
          });
        } catch (txnError) {
          try {
            await deleteUser(user);
          } catch (delError) {
            console.error("Failed to prune auth record:", delError);
          }
          throw txnError;
        }

        // --- 3. SIGNUP: Create player profile document ---
        try {
          const playerRef = doc(db, 'players', trimmedUsername);
          await setDoc(playerRef, {
            username: trimmedUsername,
            uid: user.uid,
            avatar: selectedAvatar,
            faction: selectedFaction,
            money: 12000,
            turns: 50,
            heat: 0,
            isPremium: false,
            createdAt: new Date().toISOString()
          });
        } catch (profileError) {
          try {
            const usernameRef = doc(db, 'usernames', trimmedUsername);
            await deleteDoc(usernameRef);
            await deleteUser(user);
          } catch (cleanError) {
            console.error("Cleanup failure:", cleanError);
          }
          throw new Error(`INIT ERROR: Player dossier serialization failed. ${profileError.message}`);
        }

        // Apply starting faction reputation bonus
        if (selectedFaction) {
          setFactions(prev => {
            const target = prev[selectedFaction];
            if (!target) return prev;
            return {
              ...prev,
              [selectedFaction]: { ...target, standing: target.standing + 10 }
            };
          });
        }

        setCharacterAvatar(selectedAvatar);

      } else {
        // --- 1. LOGIN: Sign in using Firebase Auth ---
        let userCredential;
        try {
          userCredential = await signInWithEmailAndPassword(auth, email, passwordInput);
        } catch (authError) {
          if (
            authError.code === 'auth/wrong-password' || 
            authError.code === 'auth/user-not-found' || 
            authError.code === 'auth/invalid-credential'
          ) {
            throw new Error("UPLINK ERROR: Security clearance denied. Credential mismatch.");
          } else {
            throw new Error(`ACCESS DENIED: Gateway authorization failed. Code: ${authError.code}`);
          }
        }

        const user = userCredential.user;
        const usernameRef = doc(db, 'usernames', trimmedUsername);
        const usernameSnap = await getDoc(usernameRef);

        if (!usernameSnap.exists()) {
          throw new Error("Alias mismatch. This mainframe node has no registered owner.");
        }

        if (usernameSnap.data().ownerUid !== user.uid) {
          throw new Error("Alias ownership validation failed. Security breach detected.");
        }

        const playerRef = doc(db, 'players', trimmedUsername);
        const playerSnap = await getDoc(playerRef);

        if (playerSnap.exists()) {
          const playerData = playerSnap.data();
          if (playerData.avatar) {
            setCharacterAvatar(playerData.avatar);
          }
        }
      }

      // Apply state to global context
      setUsername(trimmedUsername);
      const key = `focused_hertz_${trimmedUsername}_game_state`;
      const savedState = localStorage.getItem(key);

      if (!savedState) {
        startTutorial(trimmedUsername);
      }

      onLoginComplete();

    } catch (err) {
      setError(err.message || "UPLINK ERROR: Unknown gateway interruption.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-gateway-container">
      {/* Background scanlines overlay */}
      <div className="auth-matrix-lines" />

      <form 
        onSubmit={handleAuth}
        className={`glass-panel-elevated auth-card ${isSignUp ? 'pulse-pink' : 'pulse-blue'}`}
      >
        {/* Gateway Header */}
        <div className="auth-header">
          <div className={`auth-icon-wrap ${isSignUp ? 'signup-mode' : 'login-mode'}`}>
            <Fingerprint size={32} className={isSignUp ? 'text-glow-pink' : 'text-glow-blue'} />
          </div>
          <h1 className="auth-title">
            SYNDICATE GATEWAY
          </h1>
          <p className="auth-subtitle">
            SECURE DECRYPTED PROTOCOL CONNECTED
          </p>
        </div>

        {/* Tab Selection */}
        <div className="auth-tabs" role="tablist" aria-label="Credentials Toggles">
          <button
            type="button"
            onClick={() => {
              if (!loading) {
                setIsSignUp(false);
                setError('');
              }
            }}
            className={`auth-tab-btn ${!isSignUp ? 'active' : ''}`}
            aria-selected={!isSignUp}
            role="tab"
            id="tab-login"
            aria-controls="panel-login-signup"
            disabled={loading}
          >
            LOGIN
          </button>
          <button
            type="button"
            onClick={() => {
              if (!loading) {
                setIsSignUp(true);
                setError('');
              }
            }}
            className={`auth-tab-btn ${isSignUp ? 'active-signup' : ''}`}
            aria-selected={isSignUp}
            role="tab"
            id="tab-signup"
            aria-controls="panel-login-signup"
            disabled={loading}
          >
            SIGNUP
          </button>
        </div>

        {/* Unified Credentials Tab Panel */}
        <div id="panel-login-signup" role="tabpanel" aria-labelledby={isSignUp ? 'tab-signup' : 'tab-login'} className="auth-panel-flex">
          
          {/* Username/Character Alias */}
          <div className="auth-form-group">
            <label htmlFor="auth-username" className="auth-label">
              CHARACTER ALIAS / USERNAME
            </label>
            <div className="auth-input-wrapper">
              <span className={isSignUp ? 'auth-input-icon-pink' : 'auth-input-icon'}>
                <User size={16} />
              </span>
              <input 
                id="auth-username"
                type="text" 
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value.slice(0, 20))}
                required
                placeholder="Enter syndicate alias..."
                className={`auth-input ${isSignUp ? 'auth-input-signup' : ''}`}
                autoComplete="username"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-form-group">
            <label htmlFor="auth-password" className="auth-label">
              MAINFRAME PASSWORD
            </label>
            <div className="auth-input-wrapper">
              <span className={isSignUp ? 'auth-input-icon-pink' : 'auth-input-icon'}>
                <Lock size={16} />
              </span>
              <input 
                id="auth-password"
                type="password" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
                placeholder="Enter decryption key..."
                className={`auth-input ${isSignUp ? 'auth-input-signup' : ''}`}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                disabled={loading}
              />
            </div>
          </div>

          {/* Signup fields: Avatar selection and Faction affiliation */}
          {isSignUp && (
            <>
              {/* Choose Profile Recreational Image */}
              <div className="auth-form-group">
                <label className="auth-label">
                  CHOOSE PROFILE RECREATIONAL IMAGE
                </label>
                <div className="auth-avatar-grid">
                  {AVATARS.map(av => (
                    <div
                      key={av}
                      onClick={() => !loading && setSelectedAvatar(av)}
                      className={`auth-avatar-item ${selectedAvatar === av ? 'active pulse-pink' : ''}`}
                      role="button"
                      tabIndex={0}
                      aria-label={`Select avatar ${av}`}
                      onKeyDown={(e) => {
                        if (!loading && (e.key === 'Enter' || e.key === ' ')) {
                          setSelectedAvatar(av);
                        }
                      }}
                      aria-disabled={loading}
                    >
                      {av}
                    </div>
                  ))}
                </div>
              </div>

              {/* Choose Starting Background Gang Affiliation */}
              <div className="auth-form-group">
                <label className="auth-label">
                  CHOOSE STARTING BACKGROUND GANG AFFILIATION
                </label>
                <div className="auth-faction-list">
                  {FACTION_OPTIONS.map(fac => {
                    const isActive = selectedFaction === fac.id;
                    let activeClass = '';
                    if (isActive) {
                      if (fac.id === 'riderz') activeClass = 'active-riderz';
                      if (fac.id === 'people') activeClass = 'active-people';
                      if (fac.id === 'firm') activeClass = 'active-firm';
                    }
                    return (
                      <div
                        key={fac.id}
                        onClick={() => !loading && setSelectedFaction(fac.id)}
                        className={`auth-faction-card ${activeClass}`}
                        role="button"
                        tabIndex={0}
                        aria-label={`Select faction ${fac.name}`}
                        onKeyDown={(e) => {
                          if (!loading && (e.key === 'Enter' || e.key === ' ')) {
                            setSelectedFaction(fac.id);
                          }
                        }}
                        aria-disabled={loading}
                      >
                        <div className="auth-faction-info">
                          <div className={`auth-faction-name ${isActive ? `active-${fac.id}` : ''}`}>
                            {fac.name}
                          </div>
                          <div className="auth-faction-desc">
                            {fac.desc}
                          </div>
                        </div>
                        <div className="auth-faction-perks">
                          {fac.perks}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Terms of Service Compliance Block */}
              <div className="auth-tos-block">
                <ShieldAlert size={14} className="auth-tos-icon" />
                <span>I agree to obey syndicate codes, pay cuts to Turf bosses, and avoid cooperating with feds.</span>
              </div>
            </>
          )}

        </div>

        {/* Error Terminal Console */}
        {error && (
          <div className="auth-error-console pulse-red" role="alert" aria-live="assertive">
            <AlertTriangle size={16} className="auth-error-icon" />
            <span>{error}</span>
          </div>
        )}

        {/* Enter Underworld / Submit Button */}
        <button
          type="submit"
          className={`auth-submit-btn ${isSignUp ? 'signup-mode' : 'login-mode'}`}
          disabled={loading}
        >
          <Terminal size={18} />
          <span>{loading ? 'UPLINK IN PROGRESS...' : (isSignUp ? 'INITIALIZE NEW LEDGER' : 'ENTER THE UNDERWORLD')}</span>
        </button>

        {/* Social Authentication Placeholders */}
        <div className="auth-social-section">
          <div className="auth-social-label">
            EXTERNAL AUTH PROVIDER LINKAGE
          </div>
          <div className="auth-social-grid">
            <div className="auth-social-btn" aria-disabled="true">
              <span>AUTH GATEWAY [GOOGLE]</span>
              <span className="auth-social-offline">// OFFLINE</span>
            </div>
            <div className="auth-social-btn" aria-disabled="true">
              <span>AUTH GATEWAY [GITHUB]</span>
              <span className="auth-social-offline">// OFFLINE</span>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
