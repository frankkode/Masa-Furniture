import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form,    setForm]    = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

  const passwordStrength = pwd => {
    let score = 0;
    if (pwd.length >= 6)  score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score; // 0–5
  };

  const strength = passwordStrength(form.password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'][strength] || '';
  const strengthColor = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-green-600'][strength] || '';

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register(form.username.trim(), form.email.trim(), form.password);
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error
        || err.response?.data?.errors?.[0]?.msg
        || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-masa-light flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        <div className="bg-white rounded-2xl shadow-sm border border-masa-border p-8">

          {/* header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <span className="text-3xl font-bold tracking-tight text-masa-dark">Masa</span>
            </Link>
            <h1 className="text-2xl font-bold text-masa-dark mb-1">Create your account</h1>
            <p className="text-masa-gray text-sm">Join Masa and start furnishing your dream space</p>
          </div>

          {/* error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm
                            rounded-xl px-4 py-3 mb-5">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* username */}
            <div>
              <label className="block text-sm font-semibold text-masa-dark mb-1.5">Username</label>
              <input
                type="text"
                autoComplete="username"
                required
                minLength={3}
                value={form.username}
                onChange={set('username')}
                placeholder="janefurniture"
                className="w-full border border-masa-border rounded-xl px-4 py-3 text-sm text-masa-dark
                           focus:outline-none focus:border-masa-accent transition-colors placeholder-gray-400"
              />
              <p className="text-xs text-masa-gray mt-1">At least 3 characters, no spaces</p>
            </div>

            {/* email */}
            <div>
              <label className="block text-sm font-semibold text-masa-dark mb-1.5">Email address</label>
              <input
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={set('email')}
                placeholder="you@example.com"
                className="w-full border border-masa-border rounded-xl px-4 py-3 text-sm text-masa-dark
                           focus:outline-none focus:border-masa-accent transition-colors placeholder-gray-400"
              />
            </div>

            {/* password */}
            <div>
              <label className="block text-sm font-semibold text-masa-dark mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Min. 6 characters"
                  className="w-full border border-masa-border rounded-xl px-4 py-3 pr-11 text-sm text-masa-dark
                             focus:outline-none focus:border-masa-accent transition-colors placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-masa-gray hover:text-masa-dark"
                  tabIndex={-1}
                >
                  {showPwd ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {/* strength meter */}
              {form.password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <div
                        key={n}
                        className={`flex-1 h-1 rounded-full transition-colors ${n <= strength ? strengthColor : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-masa-gray">{strengthLabel}</p>
                </div>
              )}
            </div>

            {/* confirm password */}
            <div>
              <label className="block text-sm font-semibold text-masa-dark mb-1.5">Confirm Password</label>
              <input
                type={showPwd ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={form.confirm}
                onChange={set('confirm')}
                placeholder="Re-enter your password"
                className={`w-full border rounded-xl px-4 py-3 text-sm text-masa-dark
                            focus:outline-none transition-colors placeholder-gray-400
                            ${form.confirm && form.confirm !== form.password
                              ? 'border-red-400 focus:border-red-400'
                              : 'border-masa-border focus:border-masa-accent'}`}
              />
              {form.confirm && form.confirm !== form.password && (
                <p className="text-red-500 text-xs mt-1">Passwords don't match</p>
              )}
            </div>

            {/* terms */}
            <p className="text-xs text-masa-gray pt-1">
              By creating an account you agree to our{' '}
              <span className="text-masa-accent hover:underline cursor-pointer">Terms of Service</span>
              {' '}and{' '}
              <span className="text-masa-accent hover:underline cursor-pointer">Privacy Policy</span>.
            </p>

            {/* submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating account…
                </>
              ) : 'Create Account'}
            </button>
          </form>

          {/* sign in link */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-masa-border" />
            <span className="text-xs text-masa-gray">Already have an account?</span>
            <div className="flex-1 h-px bg-masa-border" />
          </div>

          <Link to="/login" className="w-full btn-outline py-3 text-sm text-center block">
            Sign In
          </Link>
        </div>

        <p className="text-center text-xs text-masa-gray mt-5 flex items-center justify-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Secured with 256-bit encryption
        </p>
      </div>
    </div>
  );
}
