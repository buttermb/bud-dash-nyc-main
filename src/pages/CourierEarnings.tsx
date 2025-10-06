import { useState, useEffect } from 'react';
import { useCourier } from '@/contexts/CourierContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Earning {
  id: string;
  order_id: string;
  order_total: number;
  commission_rate: number;
  commission_amount: number;
  tip_amount: number;
  bonus_amount: number;
  total_earned: number;
  created_at: string;
  status: string;
  week_start_date: string;
}

interface Summary {
  total: number;
  commission: number;
  tips: number;
  bonuses: number;
  deliveries: number;
  avgPerDelivery: number;
}

export default function CourierEarnings() {
  const { courier, loading: courierLoading } = useCourier();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('week');
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [summary, setSummary] = useState<Summary>({
    total: 0,
    commission: 0,
    tips: 0,
    bonuses: 0,
    deliveries: 0,
    avgPerDelivery: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courier) {
      fetchEarnings();
    }
  }, [period, courier]);

  // Redirect to login if not authenticated - must be in useEffect
  useEffect(() => {
    if (!courierLoading && !courier) {
      navigate('/courier/login');
    }
  }, [courier, courierLoading, navigate]);

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('courier-app', {
        body: { endpoint: 'earnings', period }
      });

      if (error) throw error;

      if (data?.earnings) {
        setEarnings(data.earnings);
        
        // Calculate summary
        const total = data.earnings.reduce((sum: number, e: Earning) => sum + parseFloat(e.total_earned.toString()), 0);
        const commission = data.earnings.reduce((sum: number, e: Earning) => sum + parseFloat(e.commission_amount.toString()), 0);
        const tips = data.earnings.reduce((sum: number, e: Earning) => sum + parseFloat((e.tip_amount || 0).toString()), 0);
        const bonuses = data.earnings.reduce((sum: number, e: Earning) => sum + parseFloat((e.bonus_amount || 0).toString()), 0);
        const deliveries = data.earnings.length;
        
        setSummary({
          total,
          commission,
          tips,
          bonuses,
          deliveries,
          avgPerDelivery: deliveries > 0 ? total / deliveries : 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
      toast.error('Failed to load earnings');
    } finally {
      setLoading(false);
    }
  };

  if (courierLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!courier) {
    return null; // useEffect will handle navigation
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white sticky top-0 z-50">
        <div className="p-6">
          <button
            onClick={() => navigate('/courier/dashboard')}
            className="flex items-center text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-2xl font-bold mb-2">💰 Your Earnings</h1>
          <p className="text-green-100">Track your income and payments</p>
        </div>
      </div>

      {/* Period Selector */}
      <div className="p-4">
        <div className="bg-white rounded-xl shadow p-2 flex gap-2">
          {(['week', 'month', 'all'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`
                flex-1 py-2 rounded-lg font-semibold transition
                ${period === p 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {p === 'week' && 'This Week'}
              {p === 'month' && 'This Month'}
              {p === 'all' && 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-4 mb-6">
        {/* Main Total */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl mb-4">
          <p className="text-green-100 mb-2">Total Earned</p>
          <p className="text-5xl font-bold mb-4">${summary.total.toFixed(2)}</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{summary.deliveries}</p>
              <p className="text-xs text-green-100">Deliveries</p>
            </div>
            <div>
              <p className="text-2xl font-bold">${summary.avgPerDelivery.toFixed(2)}</p>
              <p className="text-xs text-green-100">Avg/Order</p>
            </div>
            <div>
              <p className="text-2xl font-bold">${summary.tips.toFixed(2)}</p>
              <p className="text-xs text-green-100">Tips</p>
            </div>
          </div>
        </div>

        {/* Breakdown Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 text-center shadow">
            <DollarSign className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-blue-600">${summary.commission.toFixed(2)}</p>
            <p className="text-xs text-gray-600">Commission</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-green-600">${summary.tips.toFixed(2)}</p>
            <p className="text-xs text-gray-600">Tips</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow">
            <Clock className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold text-purple-600">${summary.bonuses.toFixed(2)}</p>
            <p className="text-xs text-gray-600">Bonuses</p>
          </div>
        </div>
      </div>

      {/* Earnings List */}
      <div className="px-4">
        <h3 className="font-bold text-lg mb-3">Recent Earnings</h3>
        {earnings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No earnings for this period</p>
          </div>
        ) : (
          <div className="space-y-2">
            {earnings.map(earning => (
              <div key={earning.id} className="bg-white rounded-xl p-4 shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Order #{earning.order_id.substring(0, 8)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(earning.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">
                      ${parseFloat(earning.total_earned.toString()).toFixed(2)}
                    </p>
                    <span className={`
                      text-xs px-2 py-1 rounded-full
                      ${earning.status === 'paid' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                      }
                    `}>
                      {earning.status}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <span>Commission: ${parseFloat(earning.commission_amount.toString()).toFixed(2)}</span>
                  {earning.tip_amount > 0 && (
                    <span>Tip: ${parseFloat(earning.tip_amount.toString()).toFixed(2)}</span>
                  )}
                  {earning.bonus_amount > 0 && (
                    <span className="text-purple-600">Bonus: ${parseFloat(earning.bonus_amount.toString()).toFixed(2)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
