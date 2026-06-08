import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Archive,
  RotateCcw,
  X,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Users,
  Calendar,
  DollarSign,
  AlertCircle,
  Info
} from 'lucide-react';
import { apiFetch } from '../api/apiClient';

interface ArchiveImpactAnalysis {
  stay_property: {
    id: string;
    name: string;
    current_status: string;
    can_be_archived: boolean;
  };
  linked_listing?: {
    id: string;
    title: string;
    status: string;
    will_be_archived: boolean;
  };
  active_bookings: Array<{
    booking_id: string;
    status: string;
    guest_name: string;
    check_in_date: string;
    check_out_date: string;
  }>;
  warnings: string[];
  blocking_issues: string[];
}

interface StayArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  stayProperty: {
    id: string;
    name: string;
    status: string;
    vendorName?: string;
  };
  onArchiveSuccess: () => void;
  mode: 'archive' | 'restore';
}

export const StayArchiveModal: React.FC<StayArchiveModalProps> = ({
  isOpen,
  onClose,
  stayProperty,
  onArchiveSuccess,
  mode
}) => {
  const [analysis, setAnalysis] = useState<ArchiveImpactAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [archiveReason, setArchiveReason] = useState('');
  const [confirmationPhrase, setConfirmationPhrase] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const requiredConfirmationPhrase = `ARCHIVE ${stayProperty.name.toUpperCase()}`;

  useEffect(() => {
    if (isOpen && mode === 'archive') {
      loadArchiveImpact();
    }
  }, [isOpen, mode, stayProperty.id]);

  const loadArchiveImpact = async () => {
    setLoading(true);
    try {
      const response = await apiFetch(`/admin/stays/${stayProperty.id}/archive-impact`);
      if (response.success) {
        setAnalysis(response.analysis);
      }
    } catch (error) {
      console.error('Failed to load archive impact:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    setArchiving(true);
    try {
      const response = await apiFetch(`/admin/stays/${stayProperty.id}/archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archive_reason: archiveReason })
      });

      if (response.success) {
        onArchiveSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Failed to archive stay:', error);
    } finally {
      setArchiving(false);
    }
  };

  const handleRestore = async () => {
    setArchiving(true);
    try {
      const response = await apiFetch(`/admin/stays/${stayProperty.id}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      if (response.success) {
        onArchiveSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Failed to restore stay:', error);
    } finally {
      setArchiving(false);
    }
  };

  const resetModal = () => {
    setAnalysis(null);
    setArchiveReason('');
    setConfirmationPhrase('');
    setShowConfirmation(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  const isConfirmationValid = confirmationPhrase === requiredConfirmationPhrase;
  const hasBlockingIssues = analysis?.blocking_issues && analysis.blocking_issues.length > 0;
  const hasWarnings = analysis?.warnings && analysis.warnings.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {mode === 'archive' ? (
              <Archive className="w-6 h-6 text-amber-600" />
            ) : (
              <RotateCcw className="w-6 h-6 text-green-600" />
            )}
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'archive' ? 'Archive Stay Property' : 'Restore Stay Property'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {mode === 'archive' ? (
            <>
              {/* Property Info */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Property Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">{stayProperty.name}</h4>
                      <p className="text-sm text-gray-600">
                        Current Status: <span className="font-medium">{stayProperty.status}</span>
                      </p>
                      {stayProperty.vendorName && (
                        <p className="text-sm text-gray-600">Vendor: {stayProperty.vendorName}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-gray-600">Analyzing archive impact...</p>
                  </div>
                </div>
              )}

              {/* Analysis Results */}
              {analysis && !loading && (
                <>
                  {/* Blocking Issues */}
                  {hasBlockingIssues && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <XCircle className="w-5 h-5 text-red-500" />
                        <h3 className="text-lg font-medium text-red-900">Blocking Issues</h3>
                      </div>
                      <div className="space-y-2">
                        {analysis.blocking_issues.map((issue, index) => (
                          <div key={index} className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-800">{issue}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Warnings */}
                  {hasWarnings && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <h3 className="text-lg font-medium text-amber-900">Warnings</h3>
                      </div>
                      <div className="space-y-2">
                        {analysis.warnings.map((warning, index) => (
                          <div key={index} className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-amber-800">{warning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Linked Listing Impact */}
                  {analysis.linked_listing && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Marketplace Listing Impact</h3>
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-start gap-3">
                          <Building2 className="w-5 h-5 text-blue-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-900">{analysis.linked_listing.title}</h4>
                            <p className="text-sm text-blue-700">
                              Current Status: <span className="font-medium">{analysis.linked_listing.status}</span>
                            </p>
                            {analysis.linked_listing.will_be_archived && (
                              <p className="text-sm text-blue-700 mt-1">
                                ⚠️ This listing will also be archived and removed from the marketplace
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Active Bookings */}
                  {analysis.active_bookings.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Active Bookings</h3>
                      <div className="space-y-3">
                        {analysis.active_bookings.map((booking) => (
                          <div key={booking.booking_id} className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                            <div className="flex items-start gap-3">
                              <Calendar className="w-5 h-5 text-yellow-600 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-yellow-900">{booking.guest_name}</h4>
                                <p className="text-sm text-yellow-800">
                                  Status: <span className="font-medium">{booking.status}</span>
                                </p>
                                <p className="text-sm text-yellow-800">
                                  {new Date(booking.check_in_date).toLocaleDateString()} - 
                                  {new Date(booking.check_out_date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Archive Reason */}
                  {!hasBlockingIssues && (
                    <div className="mb-6">
                      <label htmlFor="archive-reason" className="block text-sm font-medium text-gray-700 mb-2">
                        Archive Reason (Optional)
                      </label>
                      <textarea
                        id="archive-reason"
                        value={archiveReason}
                        onChange={(e) => setArchiveReason(e.target.value)}
                        placeholder="Provide a reason for archiving this stay property..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={3}
                      />
                    </div>
                  )}

                  {/* Confirmation Step */}
                  {!hasBlockingIssues && !showConfirmation && (
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setShowConfirmation(true)}
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                      >
                        Continue to Archive
                      </button>
                    </div>
                  )}

                  {/* Final Confirmation */}
                  {showConfirmation && !hasBlockingIssues && (
                    <div className="border-t border-gray-200 pt-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-medium text-red-900 mb-2">Final Confirmation</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          To confirm archiving, please type: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{requiredConfirmationPhrase}</code>
                        </p>
                        <input
                          type="text"
                          value={confirmationPhrase}
                          onChange={(e) => setConfirmationPhrase(e.target.value)}
                          placeholder="Type confirmation phrase..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setShowConfirmation(false)}
                          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleArchive}
                          disabled={!isConfirmationValid || archiving}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                          {archiving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Archiving...
                            </>
                          ) : (
                            <>
                              <Archive className="w-4 h-4" />
                              Archive Property
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            /* Restore Mode */
            <div>
              <div className="mb-6 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <RotateCcw className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Restore Stay Property</h3>
                <p className="text-sm text-gray-600">
                  This will restore the archived stay property "{stayProperty.name}" back to its previous state.
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Important Note</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      If this stay had a linked marketplace listing, it will remain archived and require separate restoration 
                      to prevent accidental publishing of content that may need re-review.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestore}
                  disabled={archiving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {archiving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Restoring...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      Restore Property
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};