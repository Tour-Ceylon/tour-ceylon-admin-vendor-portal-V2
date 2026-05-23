import { useState } from "react";
import { useToast } from "../components/shared/Toast";

/**
 * Common action hooks for consistent behavior across the portal
 */

export function useCommonActions() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Export action
  const handleExport = async (type: string, data?: any) => {
    setIsLoading(true);
    try {
      // Simulate export delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Export Successful", `${type} data has been exported to CSV`);
    } catch (error) {
      toast.error("Export Failed", "Unable to export data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Download action
  const handleDownload = async (fileName: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success("Download Started", `Downloading ${fileName}`);
    } catch (error) {
      toast.error("Download Failed", "Unable to download file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete action with confirmation
  const handleDelete = async (item: string, onConfirm?: () => void) => {
    if (window.confirm(`Are you sure you want to delete ${item}? This action cannot be undone.`)) {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        onConfirm?.();
        toast.success("Deleted Successfully", `${item} has been deleted`);
      } catch (error) {
        toast.error("Delete Failed", "Unable to delete item. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Approve action
  const handleApprove = async (item: string, onConfirm?: () => void) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      onConfirm?.();
      toast.success("Approved", `${item} has been approved successfully`);
    } catch (error) {
      toast.error("Approval Failed", "Unable to approve. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reject action with reason
  const handleReject = async (item: string, onConfirm?: () => void) => {
    const reason = prompt("Please provide a reason for rejection (optional):");
    if (reason !== null) {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        onConfirm?.();
        toast.warning("Rejected", `${item} has been rejected`);
      } catch (error) {
        toast.error("Rejection Failed", "Unable to reject. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Suspend action
  const handleSuspend = async (item: string, onConfirm?: () => void) => {
    if (window.confirm(`Are you sure you want to suspend ${item}?`)) {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        onConfirm?.();
        toast.warning("Suspended", `${item} has been suspended`);
      } catch (error) {
        toast.error("Suspension Failed", "Unable to suspend. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Activate/Restore action
  const handleActivate = async (item: string, onConfirm?: () => void) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      onConfirm?.();
      toast.success("Activated", `${item} has been activated successfully`);
    } catch (error) {
      toast.error("Activation Failed", "Unable to activate. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Send email/notification
  const handleSendEmail = async (recipient: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Email Sent", `Email sent to ${recipient}`);
    } catch (error) {
      toast.error("Send Failed", "Unable to send email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Refund action
  const handleRefund = async (amount: number, bookingId: string, onConfirm?: () => void) => {
    const confirmation = window.confirm(
      `Are you sure you want to process a refund of $${amount} for booking ${bookingId}?`
    );
    if (confirmation) {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));
        onConfirm?.();
        toast.success("Refund Processed", `Refund of $${amount} has been initiated`);
      } catch (error) {
        toast.error("Refund Failed", "Unable to process refund. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Payout action
  const handlePayout = async (amount: number, vendor: string, onConfirm?: () => void) => {
    if (window.confirm(`Process payout of $${amount} to ${vendor}?`)) {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));
        onConfirm?.();
        toast.success("Payout Processed", `Payout of $${amount} has been sent to ${vendor}`);
      } catch (error) {
        toast.error("Payout Failed", "Unable to process payout. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Assign action
  const handleAssign = async (item: string, assignee: string, onConfirm?: () => void) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      onConfirm?.();
      toast.success("Assigned", `${item} has been assigned to ${assignee}`);
    } catch (error) {
      toast.error("Assignment Failed", "Unable to assign. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Publish action
  const handlePublish = async (item: string, onConfirm?: () => void) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      onConfirm?.();
      toast.success("Published", `${item} is now live and visible to customers`);
    } catch (error) {
      toast.error("Publish Failed", "Unable to publish. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Save action
  const handleSave = async (item: string, onConfirm?: () => void) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      onConfirm?.();
      toast.success("Saved", `${item} has been saved successfully`);
    } catch (error) {
      toast.error("Save Failed", "Unable to save changes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Duplicate action
  const handleDuplicate = async (item: string, onConfirm?: () => void) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      onConfirm?.();
      toast.success("Duplicated", `${item} has been duplicated`);
    } catch (error) {
      toast.error("Duplicate Failed", "Unable to duplicate. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Archive action
  const handleArchive = async (item: string, onConfirm?: () => void) => {
    if (window.confirm(`Archive ${item}? You can restore it later.`)) {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        onConfirm?.();
        toast.info("Archived", `${item} has been archived`);
      } catch (error) {
        toast.error("Archive Failed", "Unable to archive. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    isLoading,
    handleExport,
    handleDownload,
    handleDelete,
    handleApprove,
    handleReject,
    handleSuspend,
    handleActivate,
    handleSendEmail,
    handleRefund,
    handlePayout,
    handleAssign,
    handlePublish,
    handleSave,
    handleDuplicate,
    handleArchive,
  };
}
