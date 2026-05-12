"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { careerOptions } from "@/data/careers";

const workloadOptions = ["Gaming", "Professional Work", "Student/Casual"] as const;

type Workload = (typeof workloadOptions)[number];

type UserPreferences = {
  workload: Workload;
  career: string | null;
  mobility: number;
  batteryEfficiency: number;
  budget: {
    min: number;
    max: number;
  };
  touchScreen: boolean;
  performanceScore: number;
};

type ProductSummary = {
  _id?: string;
  brand: string;
  modelName: string;
  category: string;
  price: number;
  ram: { size: string };
  storage: { capacity: string };
  processor: { modelName: string };
  battery: { estimatedRuntimeHours: number };
  display: { isTouchScreen: boolean };
  aiFeatures: { performance: number; portability: number; batteryEfficiency: number };
  inStock?: boolean;
};

type MatchResult = {
  product: ProductSummary;
  distance: number;
  matchPercentage: number;
};

const workloadScoreMap: Record<Workload, number> = {
  Gaming: 10,
  "Professional Work": 7,
  "Student/Casual": 4,
};

const stepLabels = ["Workload", "Mobility", "Budget", "Display"];

export default function AiMatchPage() {
  const [step, setStep] = useState(0);
  const [workload, setWorkload] = useState<Workload>("Gaming");
  const [career, setCareer] = useState<string>(careerOptions[0]);
  const [mobility, setMobility] = useState(6);
  const [budgetMin, setBudgetMin] = useState(900);
  const [budgetMax, setBudgetMax] = useState(2400);
  const [touchScreen, setTouchScreen] = useState(false);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [noBudgetMatches, setNoBudgetMatches] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestEmail, setRequestEmail] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [requestStatus, setRequestStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [requestFeedback, setRequestFeedback] = useState<string | null>(null);

  const budgetRangeLabel = useMemo(() => {
    return `$${budgetMin.toLocaleString()} - $${budgetMax.toLocaleString()}`;
  }, [budgetMin, budgetMax]);

  const canGoBack = step > 0;
  const canGoNext = step < stepLabels.length - 1;

  const handleNext = () => {
    if (canGoNext) {
      setStep((current) => current + 1);
    }
  };

  const handleBack = () => {
    if (canGoBack) {
      setStep((current) => current - 1);
    }
  };

  const handleSubmit = async () => {
    const userPreferences: UserPreferences = {
      workload,
      career: workload === "Professional Work" ? career : null,
      mobility,
      batteryEfficiency: mobility,
      budget: {
        min: budgetMin,
        max: budgetMax,
      },
      touchScreen,
      performanceScore: workloadScoreMap[workload],
    };

    console.log("userPreferences", userPreferences);

    setIsLoading(true);
    setErrorMessage(null);
    setNoBudgetMatches(false);

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          performanceScore: userPreferences.performanceScore,
          mobility: userPreferences.mobility,
          batteryEfficiency: userPreferences.batteryEfficiency,
          budget: userPreferences.budget,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to fetch recommendations.");
      }

      const payload = (await response.json()) as {
        matches: MatchResult[];
        reason?: string;
      };

      if (payload.reason === "no_budget_matches") {
        setMatches([]);
        setNoBudgetMatches(true);
        return;
      }

      setMatches(payload.matches ?? []);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenRequest = (match: MatchResult) => {
    setSelectedMatch(match);
    setRequestModalOpen(true);
    setRequestStatus('idle');
    setRequestFeedback(null);
  };

  const handleCloseRequest = () => {
    setRequestModalOpen(false);
    setSelectedMatch(null);
    setRequestStatus('idle');
    setRequestFeedback(null);
  };

  const handleSubmitRequest = async () => {
    if (!selectedMatch) return;
    if (!requestEmail.trim()) {
      setRequestStatus('error');
      setRequestFeedback('Please provide a valid email address.');
      return;
    }

    setRequestStatus('submitting');
    setRequestFeedback(null);

    try {
      const response = await fetch('/api/special-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: requestEmail,
          brand: selectedMatch.product.brand,
          modelName: selectedMatch.product.modelName,
          matchScore: selectedMatch.matchPercentage,
        }),
      });

      if (!response.ok) {
        throw new Error('Unable to submit request.');
      }

      setRequestStatus('success');
      setRequestFeedback('Request submitted! Our team will follow up soon.');
      setRequestEmail('');
    } catch (error) {
      setRequestStatus('error');
      setRequestFeedback(error instanceof Error ? error.message : 'Request failed.');
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-16 sm:px-8">
      <section className="rounded-2xl border border-white/10 bg-slate-950/40 p-8 shadow-lg backdrop-blur-sm">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white sm:text-5xl">
              Find Your Perfect Laptop
            </h1>
            <p className="mt-4 text-lg text-slate-300">
              Answer four questions and we'll match you with the ideal device for your needs.
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 w-fit px-4 py-3">
            <span className="text-sm font-semibold text-white">Step {step + 1} of {stepLabels.length}</span>
            <span className="text-slate-400">—</span>
            <span className="text-sm text-slate-400">{stepLabels[step]}</span>
          </div>

          {/* Progress bar */}
          <div className="h-1 w-full overflow-hidden rounded-full bg-slate-700">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${((step + 1) / stepLabels.length) * 100}%` }}
            />
          </div>

          <div className="space-y-8">

          {/* Step 1: Workload */}
          <div
            className={`space-y-6 transition-all duration-300 ${
              step === 0 ? "opacity-100" : "hidden"
            }`}
          >
            <div>
              <h2 className="text-2xl font-bold text-white">
                What's your primary use case?
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {workloadOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setWorkload(option)}
                  className={`rounded-lg border px-6 py-4 text-base font-semibold transition ${
                    workload === option
                      ? "border-blue-500 bg-blue-500/10 text-blue-200 hover-lift"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-blue-400/30"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {workload === "Professional Work" && (
              <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-6">
                <label className="block text-sm font-semibold text-slate-300">
                  Career Focus
                </label>
                <select
                  value={career}
                  onChange={(event) => setCareer(event.target.value)}
                  className="mt-3 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none"
                >
                  {careerOptions.map((option) => (
                    <option key={option} value={option} className="text-slate-900">
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Step 2: Mobility */}
          <div
            className={`space-y-6 transition-all duration-300 ${
              step === 1 ? "opacity-100" : "hidden"
            }`}
          >
            <div>
              <h2 className="text-2xl font-bold text-white">
                How important is portability?
              </h2>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                <span>Less Important</span>
                <span>More Important</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={mobility}
                onChange={(event) => setMobility(Number(event.target.value))}
                className="w-full accent-blue-500"
              />
              <p className="mt-4 text-center text-lg font-semibold text-blue-400">
                Portability Score: {mobility}/10
              </p>
            </div>
          </div>

          {/* Step 3: Budget */}
          <div
            className={`space-y-6 transition-all duration-300 ${
              step === 2 ? "opacity-100" : "hidden"
            }`}
          >
            <div>
              <h2 className="text-2xl font-bold text-white">
                What's your budget range?
              </h2>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <p className="text-center text-xl font-bold text-blue-400 mb-6">
                {budgetRangeLabel}
              </p>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-300">
                    Minimum Budget
                  </label>
                  <input
                    type="range"
                    min={500}
                    max={3500}
                    step={50}
                    value={budgetMin}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setBudgetMin(Math.min(value, budgetMax - 200));
                    }}
                    className="w-full accent-blue-500"
                  />
                  <p className="text-xs text-slate-400">${budgetMin.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-300">
                    Maximum Budget
                  </label>
                  <input
                    type="range"
                    min={700}
                    max={4500}
                    step={50}
                    value={budgetMax}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setBudgetMax(Math.max(value, budgetMin + 200));
                    }}
                    className="w-full accent-blue-500"
                  />
                  <p className="text-xs text-slate-400">${budgetMax.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Touch Screen */}
          <div
            className={`space-y-6 transition-all duration-300 ${
              step === 3 ? "opacity-100" : "hidden"
            }`}
          >
            <div>
              <h2 className="text-2xl font-bold text-white">
                Do you need a touch screen?
              </h2>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setTouchScreen(true)}
                className={`flex-1 rounded-lg border px-6 py-4 text-base font-semibold transition ${
                  touchScreen
                    ? "border-blue-500 bg-blue-500/10 text-blue-200 hover-lift"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-blue-400/30"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setTouchScreen(false)}
                className={`flex-1 rounded-lg border px-6 py-4 text-base font-semibold transition ${
                  !touchScreen
                    ? "border-blue-500 bg-blue-500/10 text-blue-200 hover-lift"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-blue-400/30"
                }`}
              >
                No
              </button>
            </div>
          </div>        </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-4 pt-8 border-t border-white/10">
            <button
              type="button"
              onClick={handleBack}
              disabled={!canGoBack}
              className="px-6 py-3 rounded-lg border border-white/10 text-white font-semibold transition hover:bg-white/5 disabled:opacity-40"
            >
              Back
            </button>
            <div className="flex gap-3">
              {canGoNext ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold transition hover:bg-blue-700 hover-lift"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-8 py-3 rounded-lg bg-blue-600 text-white font-semibold transition hover:bg-blue-700 hover-lift disabled:opacity-50"
                >
                  {isLoading ? "Calculating..." : "Find Matches"}
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          {isLoading && (
            <div className="mt-8 text-center">
              <p className="text-slate-300">Analyzing your preferences...</p>
            </div>
          )}

          {errorMessage && (
            <div className="mt-8 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-red-200">
              {errorMessage}
            </div>
          )}

          {noBudgetMatches && (
            <div className="mt-8 rounded-lg border border-yellow-400/30 bg-yellow-500/10 p-4 text-yellow-200">
              No laptops match your exact budget. Try adjusting your range.
            </div>
          )}

          {/* Results */}
          {matches.length > 0 && (
            <div className="mt-12 space-y-8">
              <h2 className="text-3xl font-bold text-white">Your Matches</h2>
              <div className="grid gap-6 sm:grid-cols-3">
                {matches.map((match) => (
                  <article
                    key={match.product._id || `${match.product.brand}-${match.product.modelName}`}
                    className="hover-lift rounded-lg border border-white/10 bg-slate-950/40 p-6 shadow-lg transition backdrop-blur-sm"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-xs font-semibold text-blue-400">
                        {match.matchPercentage}% Match
                      </span>
                      {!match.product.inStock && (
                        <span className="text-xs font-semibold text-yellow-400">
                          Limited Stock
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      {match.product.brand} {match.product.modelName}
                    </h3>
                    <p className="mt-2 text-sm text-slate-400">{match.product.category}</p>
                    <p className="mt-4 text-2xl font-bold text-blue-400">
                      ${match.product.price.toLocaleString()}
                    </p>
                    <ul className="mt-6 space-y-2 text-sm text-slate-300">
                      <li>• RAM: {match.product.ram?.size ?? "—"}</li>
                      <li>• Storage: {match.product.storage?.capacity ?? "—"}</li>
                      <li>• CPU: {match.product.processor?.modelName ?? "—"}</li>
                      <li>
                        • Battery:{" "}
                        {match.product.battery?.estimatedRuntimeHours
                          ? `${match.product.battery.estimatedRuntimeHours}h`
                          : "—"}
                      </li>
                    </ul>
                    <div className="mt-6">
                      {match.product.inStock ? (
                        <Link
                          href={`/checkout?productId=${match.product._id}&price=${match.product.price}`}
                          className="block text-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          Buy Now
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenRequest(match)}
                          className="w-full rounded-lg bg-yellow-500 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-yellow-400"
                        >
                          Request Special Order
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      {requestModalOpen && selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/90 p-8 shadow-2xl backdrop-blur-sm">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white">
                {selectedMatch.product.brand} {selectedMatch.product.modelName}
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Match Score: {selectedMatch.matchPercentage}%
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300">Email Address</label>
                <input
                  type="email"
                  value={requestEmail}
                  onChange={(event) => setRequestEmail(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none"
                  placeholder="you@example.com"
                />
              </div>

              {requestFeedback && (
                <div
                  className={`rounded-lg border px-4 py-3 text-sm ${
                    requestStatus === "success"
                      ? "border-green-400/30 bg-green-500/10 text-green-200"
                      : "border-red-400/30 bg-red-500/10 text-red-200"
                  }`}
                >
                  {requestFeedback}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseRequest}
                  className="flex-1 rounded-lg border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitRequest}
                  disabled={requestStatus === "submitting"}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {requestStatus === "submitting" ? "Sending..." : "Submit Request"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
