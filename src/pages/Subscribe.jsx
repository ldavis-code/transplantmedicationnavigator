import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CreditCard, CheckCircle, Shield, ArrowLeft, Loader2, AlertCircle, User, LogIn, Gift, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useSubscriberAuth } from '../context/SubscriberAuthContext';
import { useMetaTags } from '../hooks/useMetaTags';
import { seoMetadata } from '../data/seo-metadata';

const Subscribe = () => {
    useMetaTags(seoMetadata.subscribe);

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { isAuthenticated, user, refreshUser, register } = useSubscriberAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Registration form state (for non-authenticated users)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [hasExistingAccount, setHasExistingAccount] = useState(false);

    // Patient code state
    const [patientCode, setPatientCode] = useState('');
    const [codeLoading, setCodeLoading] = useState(false);
    const [codeError, setCodeError] = useState(null);
    const [codeSuccess, setCodeSuccess] = useState(false);

    const plan = searchParams.get('plan') || 'monthly';

    // Password validation
    const isPasswordValid = password.length >= 8;
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

    const plans = {
        monthly: {
            name: 'Monthly',
            price: '$8.99',
            period: 'per month',
            description: 'Billed monthly, cancel anytime',
            color: 'blue'
        },
        yearly: {
            name: 'Yearly',
            price: '$79.99',
            period: 'per year',
            description: 'Save 26% - Best value!',
            color: 'purple'
        }
    };

    const selectedPlan = plans[plan] || plans.monthly;

    const features = [
        'Unlimited My Path Quiz',
        'Save medications',
        'Share and print your list',
        'Unlimited medications in Search Meds',
        'Reminders on copay cards',
        'My Medication Savings'
    ];

    const handleRedeemCode = async (e) => {
        e.preventDefault();
        if (!patientCode.trim()) return;

        setCodeLoading(true);
        setCodeError(null);
        setCodeSuccess(false);

        try {
            let userEmail = user?.email;

            // If not authenticated, register the user first
            if (!isAuthenticated) {
                // Validate registration fields
                if (!email.trim()) {
                    throw new Error('Please enter your email address above');
                }
                if (!isPasswordValid) {
                    throw new Error('Password must be at least 8 characters');
                }
                if (!passwordsMatch) {
                    throw new Error('Passwords do not match');
                }

                // Register the user
                const registerResult = await register(email.trim(), password, name.trim());

                if (!registerResult.success) {
                    if (registerResult.error?.includes('already exists')) {
                        setHasExistingAccount(true);
                        throw new Error('An account with this email already exists. Please sign in first.');
                    }
                    throw new Error(registerResult.error || 'Failed to create account');
                }

                userEmail = registerResult.user.email;
            }

            const response = await fetch('/.netlify/functions/redeem-patient-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: patientCode.trim(),
                    email: userEmail
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to redeem code');
            }

            setCodeSuccess(true);
            setPatientCode('');
            // Refresh user data to reflect new Pro status
            if (refreshUser) {
                await refreshUser();
            }
            // Redirect to account page after successful redemption
            setTimeout(() => {
                navigate('/account');
            }, 2000);
        } catch (err) {
            setCodeError(err.message);
        } finally {
            setCodeLoading(false);
        }
    };

    const handleSubscribe = async () => {
        setLoading(true);
        setError(null);

        try {
            let currentUser = user;
            let userEmail = user?.email || null;
            let userId = user?.id || null;

            // If not authenticated, register the user first
            if (!isAuthenticated) {
                // Validate registration fields
                if (!email.trim()) {
                    throw new Error('Please enter your email address');
                }
                if (!isPasswordValid) {
                    throw new Error('Password must be at least 8 characters');
                }
                if (!passwordsMatch) {
                    throw new Error('Passwords do not match');
                }

                // Register the user
                const registerResult = await register(email.trim(), password, name.trim());

                if (!registerResult.success) {
                    // Check if user already exists and suggest login
                    if (registerResult.error?.includes('already exists')) {
                        setHasExistingAccount(true);
                        throw new Error('An account with this email already exists. Please sign in below.');
                    }
                    throw new Error(registerResult.error || 'Failed to create account');
                }

                // Use the newly registered user's info
                currentUser = registerResult.user;
                userEmail = registerResult.user.email;
                userId = registerResult.user.id;
            }

            // Create Stripe checkout session
            const response = await fetch('/.netlify/functions/create-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    plan: plan,
                    email: userEmail,
                    userId: userId
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create checkout session');
            }

            // Redirect to Stripe Checkout
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL received');
            }
        } catch (err) {
            console.error('Subscription error:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    const colorClasses = {
        blue: {
            bg: 'bg-blue-50',
            border: 'border-blue-300',
            button: 'bg-blue-700 hover:bg-blue-800',
            check: 'text-blue-600',
            badge: 'bg-blue-100 text-blue-800'
        },
        purple: {
            bg: 'bg-purple-50',
            border: 'border-purple-300',
            button: 'bg-purple-700 hover:bg-purple-800',
            check: 'text-purple-600',
            badge: 'bg-purple-100 text-purple-800'
        }
    };

    const colors = colorClasses[selectedPlan.color];

    return (
        <article className="max-w-2xl mx-auto space-y-8 pb-12">
            {/* Back Link */}
            <Link
                to="/pricing"
                className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-700 transition"
            >
                <ArrowLeft size={18} />
                Back to Pricing
            </Link>

            {/* Header */}
            <header className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6">
                    <CreditCard size={32} className="text-emerald-700" />
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
                    Subscribe to Pro
                </h1>
                <p className="text-lg text-slate-600">
                    Unlock all features with a {selectedPlan.name.toLowerCase()} subscription
                </p>
            </header>

            {/* Account Status / Registration Form */}
            {!isAuthenticated && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <User size={24} className="text-emerald-600" />
                        <div>
                            <h3 className="font-bold text-slate-900">Create Your Account</h3>
                            <p className="text-slate-600 text-sm">
                                Enter your details to create an account and subscribe in one step.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Name (optional) */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                                Name <span className="text-slate-400">(optional)</span>
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="Your name"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="Create a password (8+ characters)"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {password.length > 0 && !isPasswordValid && (
                                <p className="mt-1 text-xs text-amber-600">Password must be at least 8 characters</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                                Confirm Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                                        confirmPassword.length > 0
                                            ? passwordsMatch
                                                ? 'border-emerald-500'
                                                : 'border-red-300'
                                            : 'border-slate-300'
                                    }`}
                                    placeholder="Confirm your password"
                                />
                            </div>
                            {confirmPassword.length > 0 && !passwordsMatch && (
                                <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                            )}
                        </div>
                    </div>

                    {/* Already have an account link */}
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-sm text-slate-600">
                            Already have an account?{' '}
                            <Link
                                to={`/login?redirect=/subscribe?plan=${plan}`}
                                className="text-emerald-700 hover:text-emerald-800 font-medium underline"
                            >
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            )}

            {isAuthenticated && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle size={20} className="text-emerald-600" />
                        <div>
                            <p className="text-emerald-800 font-medium">Signed in as {user.email}</p>
                            <p className="text-emerald-700 text-sm">Your subscription will be linked to your account.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Plan Selection */}
            <div className="flex gap-4 justify-center">
                <button
                    onClick={() => navigate('/subscribe?plan=monthly')}
                    className={`px-6 py-3 rounded-xl font-bold transition ${
                        plan === 'monthly'
                            ? 'bg-blue-700 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                    Monthly
                </button>
                <button
                    onClick={() => navigate('/subscribe?plan=yearly')}
                    className={`px-6 py-3 rounded-xl font-bold transition ${
                        plan === 'yearly'
                            ? 'bg-purple-700 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                    Yearly (Save 26%)
                </button>
            </div>

            {/* Plan Card */}
            <div className={`${colors.bg} border-2 ${colors.border} rounded-2xl p-8`}>
                <div className="text-center mb-6">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${colors.badge} mb-4`}>
                        {selectedPlan.name} Plan
                    </span>
                    <div className="flex items-baseline justify-center gap-2">
                        <span className="text-4xl font-bold text-slate-900">{selectedPlan.price}</span>
                        <span className="text-slate-600">{selectedPlan.period}</span>
                    </div>
                    <p className="text-slate-600 mt-2">{selectedPlan.description}</p>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <CheckCircle size={20} className={colors.check} />
                            <span className="text-slate-700">{feature}</span>
                        </div>
                    ))}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
                        <AlertCircle size={20} className="text-red-600" />
                        <span className="text-red-700">{error}</span>
                    </div>
                )}

                {/* Subscribe Button */}
                <button
                    onClick={handleSubscribe}
                    disabled={loading || (!isAuthenticated && (!email.trim() || !isPasswordValid || !passwordsMatch))}
                    className={`w-full ${colors.button} text-white font-bold py-4 px-6 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {loading ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            {!isAuthenticated ? 'Creating Account & Processing...' : 'Processing...'}
                        </>
                    ) : (
                        <>
                            <CreditCard size={20} />
                            {isAuthenticated ? 'Subscribe Now' : 'Create Account & Subscribe'}
                        </>
                    )}
                </button>
            </div>

            {/* Security Notice */}
            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                <Shield size={16} />
                <span>Secure payment powered by Stripe</span>
            </div>

            {/* Patient Code Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Gift size={24} className="text-emerald-600" />
                    <div>
                        <h3 className="font-bold text-slate-900">Have a Patient Code?</h3>
                        <p className="text-slate-600 text-sm">
                            If your healthcare provider gave you a patient assistance code, enter it below for free Pro access.
                        </p>
                    </div>
                </div>

                {!isAuthenticated && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-blue-800 text-sm">
                            Fill out your account details above, then enter your code below. We'll create your account and activate Pro access.
                        </p>
                    </div>
                )}

                {codeSuccess ? (
                    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <CheckCircle size={20} className="text-emerald-600" />
                        <div>
                            <p className="text-emerald-800 font-medium">Code redeemed successfully!</p>
                            <p className="text-emerald-700 text-sm">Redirecting to your account...</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleRedeemCode} className="space-y-3">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={patientCode}
                                onChange={(e) => setPatientCode(e.target.value)}
                                placeholder="Enter patient code"
                                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                disabled={codeLoading}
                            />
                            <button
                                type="submit"
                                disabled={codeLoading || !patientCode.trim()}
                                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {codeLoading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Redeeming...
                                    </>
                                ) : (
                                    'Redeem'
                                )}
                            </button>
                        </div>
                        {codeError && (
                            <div className="flex items-center gap-2 text-red-600 text-sm">
                                <AlertCircle size={16} />
                                <span>{codeError}</span>
                            </div>
                        )}
                    </form>
                )}
            </div>

            {/* Terms */}
            <p className="text-center text-slate-500 text-sm">
                By subscribing, you agree to our{' '}
                <Link to="/terms-and-conditions" className="text-emerald-700 hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-emerald-700 hover:underline">Privacy Policy</Link>.
                Cancel anytime from your account settings.
            </p>
        </article>
    );
};

export default Subscribe;
