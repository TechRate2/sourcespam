/**
 * PRODUCTION MONITORING DASHBOARD
 * Real-time monitoring of DID pool and webhook recovery system
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Zap,
  Shield,
  Settings,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface PoolStatus {
  totalCount: number;
  availableCount: number;
  blockedCount: number;
  staleCount: number;
}

interface RecoveryStats {
  totalRecovered: number;
  stuckCalls: number;
  orphanedDids: number;
  emergencyReleases: number;
}

interface MonitorData {
  pool: PoolStatus;
  recovery: RecoveryStats;
  health: {
    status: 'healthy' | 'critical';
    recommendation: string;
  };
}

export default function ProductionMonitor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch DID pool status every 10 seconds
  const { data: monitorData, isLoading } = useQuery<MonitorData>({
    queryKey: ['/api/admin/did-pool/status'],
    retry: false,
    refetchInterval: 10000, // Real-time monitoring
  });

  // Manual recovery mutation
  const manualRecoveryMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/recovery/manual');
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Recovery Completed",
        description: data.result,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/did-pool/status'] });
    },
    onError: (error: any) => {
      toast({
        title: "Recovery Failed", 
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Force release all DIDs mutation
  const forceReleaseMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/dids/release-all');
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "DIDs Released",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/did-pool/status'] });
    },
    onError: (error: any) => {
      toast({
        title: "Release Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card className="pro-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
            <span className="ml-2 text-white">Loading monitoring data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pool = monitorData?.pool;
  const health = monitorData?.health;

  return (
    <div className="space-y-6">
      {/* Health Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-lg border ${
          health?.status === 'healthy' 
            ? 'bg-green-900/20 border-green-600' 
            : 'bg-red-900/20 border-red-600'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {health?.status === 'healthy' ? (
              <CheckCircle className="w-6 h-6 text-green-400" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-red-400" />
            )}
            <div>
              <h3 className="text-lg font-semibold text-white">
                System Status: {health?.status === 'healthy' ? 'Healthy' : 'Critical'}
              </h3>
              <p className="text-sm text-slate-300">{health?.recommendation}</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={() => manualRecoveryMutation.mutate()}
              disabled={manualRecoveryMutation.isPending}
              variant="outline"
              size="sm"
              className="border-yellow-600 text-yellow-400 hover:bg-yellow-800"
            >
              {manualRecoveryMutation.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              Manual Recovery
            </Button>
            
            <Button
              onClick={() => forceReleaseMutation.mutate()}
              disabled={forceReleaseMutation.isPending}
              variant="outline"
              size="sm"
              className="border-red-600 text-red-400 hover:bg-red-800"
            >
              {forceReleaseMutation.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Shield className="w-4 h-4 mr-2" />
              )}
              Force Release All
            </Button>
          </div>
        </div>
      </motion.div>

      {/* DID Pool Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="pro-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total DIDs</p>
                  <p className="text-2xl font-bold text-white">{pool?.totalCount || 0}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="pro-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Available</p>
                  <p className={`text-2xl font-bold ${
                    (pool?.availableCount || 0) > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {pool?.availableCount || 0}
                  </p>
                </div>
                <CheckCircle className={`w-8 h-8 ${
                  (pool?.availableCount || 0) > 0 ? 'text-green-400' : 'text-red-400'
                }`} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="pro-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Blocked</p>
                  <p className={`text-2xl font-bold ${
                    (pool?.blockedCount || 0) > 0 ? 'text-yellow-400' : 'text-slate-400'
                  }`}>
                    {pool?.blockedCount || 0}
                  </p>
                </div>
                <Clock className={`w-8 h-8 ${
                  (pool?.blockedCount || 0) > 0 ? 'text-yellow-400' : 'text-slate-400'
                }`} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="pro-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Stale</p>
                  <p className={`text-2xl font-bold ${
                    (pool?.staleCount || 0) > 0 ? 'text-orange-400' : 'text-slate-400'
                  }`}>
                    {pool?.staleCount || 0}
                  </p>
                </div>
                <AlertTriangle className={`w-8 h-8 ${
                  (pool?.staleCount || 0) > 0 ? 'text-orange-400' : 'text-slate-400'
                }`} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Pool Health Visualization */}
      <Card className="pro-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            DID Pool Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Availability Bar */}
            <div>
              <div className="flex justify-between text-sm text-slate-300 mb-1">
                <span>Pool Availability</span>
                <span>{Math.round(((pool?.availableCount || 0) / (pool?.totalCount || 1)) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    (pool?.availableCount || 0) > 0 
                      ? 'bg-gradient-to-r from-green-500 to-green-400'
                      : 'bg-gradient-to-r from-red-500 to-red-400'
                  }`}
                  style={{ 
                    width: `${Math.max(5, ((pool?.availableCount || 0) / (pool?.totalCount || 1)) * 100)}%` 
                  }}
                />
              </div>
            </div>

            {/* Efficiency Metrics */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400 text-sm">Pool Efficiency</p>
                <p className="text-lg font-bold text-blue-400">
                  {Math.round(((pool?.totalCount || 0) - (pool?.staleCount || 0)) / (pool?.totalCount || 1) * 100)}%
                </p>
              </div>
              <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400 text-sm">Utilization Rate</p>
                <p className="text-lg font-bold text-purple-400">
                  {Math.round(((pool?.blockedCount || 0) / (pool?.totalCount || 1)) * 100)}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Features */}
      <Card className="pro-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Production-Grade Features Active
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Badge variant="outline" className="border-green-600 text-green-400 p-2">
              ✓ Auto-Recovery System
            </Badge>
            <Badge variant="outline" className="border-blue-600 text-blue-400 p-2">
              ✓ Webhook Failure Detection
            </Badge>
            <Badge variant="outline" className="border-purple-600 text-purple-400 p-2">
              ✓ Stale DID Cleanup
            </Badge>
            <Badge variant="outline" className="border-yellow-600 text-yellow-400 p-2">
              ✓ Emergency Pool Recovery
            </Badge>
            <Badge variant="outline" className="border-orange-600 text-orange-400 p-2">
              ✓ Real-time Monitoring
            </Badge>
            <Badge variant="outline" className="border-pink-600 text-pink-400 p-2">
              ✓ Health Check System
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}