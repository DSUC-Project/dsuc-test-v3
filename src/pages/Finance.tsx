
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion } from 'motion/react';
import { Check, X, ScanLine, ArrowRight, Zap, Upload } from 'lucide-react';
import { useStore } from '../store/useStore';
import { FinanceRequest, Member } from '../types';
import { BANKS } from '../data/mockData';
import { SectionHeader, SoftBrutalCard, ActionButton } from '@/components/ui/Primitives';

export function Finance() {
  const [activeTab, setActiveTab] = useState<'submit' | 'pending' | 'history' | 'direct'>('submit');
  const { financeRequests, financeHistory, fetchPendingRequests, fetchFinanceHistory, fetchMembers, currentUser } = useStore();
  const isOfficialMember = currentUser?.memberType === 'member';
  const canModerateFinance =
    isOfficialMember &&
    ['President', 'Vice-President'].includes(currentUser?.role || '');
  const visibleTabs = canModerateFinance
    ? ['submit', 'direct', 'pending', 'history']
    : ['submit', 'direct', 'history'];
  const tabLabels: Record<string, string> = {
    submit: 'Requests',
    direct: 'Direct Transfer',
    pending: 'Pending',
    history: 'History',
  };

  // Fetch members on mount (needed for bank info lookup in ApprovalModal)
  useEffect(() => {
    if (isOfficialMember) {
      fetchMembers();
    }
  }, [isOfficialMember, fetchMembers]);

  // Fetch pending requests when tab changes to pending (for admin)
  useEffect(() => {
    if (activeTab === 'pending' && canModerateFinance) {
      fetchPendingRequests();
    }
  }, [activeTab, canModerateFinance, fetchPendingRequests]);

  // Fetch finance history when tab changes to history
  useEffect(() => {
    if (activeTab === 'history' && isOfficialMember) {
      fetchFinanceHistory();
    }
  }, [activeTab, isOfficialMember, fetchFinanceHistory]);

  useEffect(() => {
    if (activeTab === 'pending' && !canModerateFinance) {
      setActiveTab('submit');
    }
  }, [activeTab, canModerateFinance]);

  if (!currentUser || !isOfficialMember) {
    return (
      <div className="mx-auto max-w-5xl space-y-8 pt-10 px-4">
        <SoftBrutalCard className="min-h-[500px] flex-col items-center justify-center space-y-6 text-center p-8 md:p-16 flex">
          <div className="flex h-20 w-20 items-center justify-center border brutal-border bg-accent text-4xl">🔒</div>
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-text-main">Finance is for members only</h2>
          <p className="max-w-md border brutal-border bg-main-bg px-4 py-3 text-sm font-mono font-bold uppercase tracking-widest text-text-main">
            Please log in with a member account to access this module.
          </p>
          <div className="max-w-lg text-[10px] font-mono font-bold uppercase tracking-widest text-text-muted">
            Community accounts do not have permission to view the ledger.
          </div>
        </SoftBrutalCard>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 space-y-12">
      <div className="flex flex-col items-start justify-between gap-6 border-b brutal-border pb-8 md:flex-row md:items-end">
        <SectionHeader title="FINANCE LEDGER" subtitle="Submit payment requests, direct transfers, and history." className="mb-0 border-none pb-0" />
        <div className="flex flex-wrap gap-2 border brutal-border bg-surface p-2 w-full md:w-auto">
          {visibleTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex items-center gap-2 border px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${activeTab === tab ? 'border-brutal-border bg-primary text-main-bg' : 'border-transparent bg-transparent text-text-muted hover:border-brutal-border hover:bg-main-bg hover:text-text-main'}`}
            >
              {tab === 'direct' && <Zap size={14} />}
              {tabLabels[tab] || tab}
              {tab === 'pending' && financeRequests.length > 0 && (
                <span className="ml-1 border border-brutal-border bg-error px-1.5 py-0.5 text-[10px] font-mono font-bold text-main-bg">{financeRequests.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'submit' && <SubmitRequestForm onSubmitted={() => setActiveTab('pending')} />}
        {activeTab === 'direct' && <DirectTransferTool />}
        {activeTab === 'pending' && <PendingRequestsList />}
        {activeTab === 'history' && <HistoryList />}
      </div>
    </div>
  );
}

function SubmitRequestForm({ onSubmitted }: { onSubmitted: () => void }) {
  const { submitFinanceRequest, currentUser } = useStore();
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState('');
  const [billImage, setBillImage] = useState<string | null>(null);
  const [billFile, setBillFile] = useState<File | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBillImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setBillFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      alert('Vui lòng đăng nhập trước.');
      return;
    }

    try {
      await submitFinanceRequest({
        id: Math.random().toString(),
        amount,
        reason,
        date,
        billImage,
        status: 'pending',
        requesterName: currentUser.name || 'Unknown',
        requesterId: currentUser.id
      });

      setAmount('');
      setReason('');
      setDate('');
      setBillImage(null);
      setBillFile(null);

      onSubmitted();
    } catch (err) {
      alert('Cannot send request. Try again.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 border brutal-border bg-primary px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-widest text-main-bg">
            <Zap size={14} />
            Payment Request
          </div>
          <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-text-main">Submit reimbursement request</h3>
          <p className="mt-4 border-l-2 brutal-border pl-4 text-sm font-mono text-text-muted">Create a reimbursement request for club operations. A receipt is required.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 border brutal-border bg-surface p-6">
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-muted">Amount (VND)</label>
            <input value={amount} onChange={e => setAmount(e.target.value)} type="number" required className="w-full border brutal-border bg-main-bg p-4 font-mono text-xl font-bold text-text-main outline-none transition-colors focus:border-primary" placeholder="500000" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-muted">Target Date</label>
            <input value={date} onChange={e => setDate(e.target.value)} type="date" required className="w-full border brutal-border bg-main-bg p-4 font-mono text-sm font-bold text-text-main outline-none transition-colors focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-muted">Justification</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} required rows={4} className="w-full border brutal-border bg-main-bg p-4 text-sm font-mono text-text-main outline-none transition-colors focus:border-primary resize-none" placeholder="Description of the expense..." />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-muted">Bill / Receipt</label>
            <div className="relative border border-dashed brutal-border bg-main-bg transition-colors hover:bg-surface">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                required
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {billImage ? (
                <div className="p-4">
                  <img src={billImage} alt="Bill preview" className="mb-2 max-h-40 w-full border brutal-border object-contain bg-surface" />
                  <div className="flex items-center justify-center gap-2 font-mono text-[10px] font-bold text-primary">
                    <Check size={14} /> {billFile?.name}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Upload size={32} className="mx-auto mb-2 text-text-muted" />
                  <div className="mb-1 font-mono text-xs font-bold text-text-main">Click to upload bill</div>
                  <div className="font-mono text-[10px] text-text-muted">PNG, JPG up to 10MB</div>
                </div>
              )}
            </div>
          </div>

          <ActionButton type="submit" variant="primary" className="w-full">
            SUBMIT REQUEST
          </ActionButton>
        </form>
      </div>
      <div className="hidden h-full border brutal-border bg-accent p-8 lg:flex lg:flex-col lg:justify-between">
        <div className="inline-flex w-fit items-center gap-2 border brutal-border bg-surface px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-widest text-text-main">
          <ScanLine size={14} />
          Finance Channel
        </div>
        <div>
          <h4 className="font-display text-2xl font-bold uppercase tracking-tight text-text-main mb-4">Transparent expenses</h4>
          <p className="border brutal-border bg-main-bg px-4 py-3 text-xs font-mono text-text-main">
            All requests, approvals, and transaction history are aggregated here for unified review by the Executive team.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function DirectTransferTool() {
  const { members } = useStore();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [amount, setAmount] = useState('');
  const [content, setContent] = useState('');
  const [billFile, setBillFile] = useState<File | null>(null);
  const [showQR, setShowQR] = useState(false);

  const eligibleMembers = members.filter(
    (m) => (m.memberType !== 'community' && m.member_type !== 'community') && (m.bankInfo || m.bank_info)
  );

  const getBankInfo = (member: Member) => {
    const info = member.bankInfo || member.bank_info;
    if (!info) return null;

    return {
      bankId: info.bankId || (info as any).bank_id,
      accountNo: info.accountNo || (info as any).account_no,
      accountName: info.accountName || (info as any).account_name
    };
  };

  const bankInfo = selectedMember ? getBankInfo(selectedMember) : null;
  const qrUrl = bankInfo
    ? `https://img.vietqr.io/image/${bankInfo.bankId}-${bankInfo.accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(content)}`
    : '';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <h3 className="flex items-center gap-2 font-display text-2xl font-bold uppercase tracking-widest text-text-main">
          <Zap size={20} /> QUICK TRANSFER LINK
        </h3>
        <p className="border-l-2 brutal-border pl-4 text-sm font-mono text-text-muted">Select a member to generate a quick transfer QR code and save the receipt.</p>

        {!selectedMember ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
            {eligibleMembers.map(member => {
              const memberBankInfo = getBankInfo(member);
              return (
                <button
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className="flex flex-col gap-2 border brutal-border bg-surface p-4 text-left transition-colors hover:bg-main-bg"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 overflow-hidden border brutal-border bg-accent">
                      <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="font-display text-base font-bold text-text-main">{member.name}</div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">{member.role}</div>
                    </div>
                  </div>
                  {memberBankInfo && (
                    <div className="pl-14 space-y-1">
                      <div className="text-[9px] font-mono font-bold text-primary">
                        {BANKS.find(b => b.id === memberBankInfo.bankId)?.shortName || memberBankInfo.bankId}
                      </div>
                      {memberBankInfo.accountName && (
                        <div className="text-[9px] font-mono text-text-muted">
                          {memberBankInfo.accountName}
                        </div>
                      )}
                      <div className="text-[9px] font-mono text-text-muted">
                        {memberBankInfo.accountNo}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
            {eligibleMembers.length === 0 && (
              <div className="col-span-2 border brutal-border bg-surface py-10 text-center text-xs font-mono font-bold uppercase tracking-widest text-text-muted">No members with bank data</div>
            )}
          </div>
        ) : (
          <SoftBrutalCard className="space-y-6 p-6">
            <div className="flex items-center justify-between border-b brutal-border pb-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 overflow-hidden border brutal-border bg-accent">
                  <img src={selectedMember.avatar} alt={selectedMember.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-display text-lg font-bold text-text-main">{selectedMember.name}</div>
                      <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">Recipient selected</div>
                </div>
              </div>
              <button onClick={() => { setSelectedMember(null); setShowQR(false); }} className="border border-transparent p-2 text-text-muted transition-colors hover:border-brutal-border hover:bg-main-bg"><X size={16} /></button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-muted">Amount</label>
                <input value={amount} onChange={e => setAmount(e.target.value)} type="number" className="w-full border brutal-border bg-main-bg p-3 font-mono font-bold text-text-main outline-none transition-colors focus:border-primary" placeholder="0" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-muted">Message</label>
                <input value={content} onChange={e => setContent(e.target.value)} type="text" className="w-full border brutal-border bg-main-bg p-3 font-mono text-text-main outline-none transition-colors focus:border-primary" placeholder="Payment for..." />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-muted">Proof of Bill</label>
                <div className="relative border border-dashed brutal-border bg-main-bg p-4 text-center transition-colors hover:bg-surface">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBillFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {billFile ? (
                    <div className="flex items-center justify-center gap-2 font-mono text-[10px] font-bold text-primary">
                      <Check size={14} /> {billFile.name}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 font-mono text-[10px] font-bold text-text-muted">
                      <Upload size={14} /> Upload Receipt
                    </div>
                  )}
                </div>
              </div>

              <ActionButton
                variant="primary"
                onClick={() => setShowQR(true)}
                disabled={!amount}
                className="w-full"
              >
                GENERATE QR
              </ActionButton>
            </div>
          </SoftBrutalCard>
        )}
      </div>

      <div className="relative flex items-center justify-center border brutal-border bg-surface min-h-[360px]">
        {showQR && selectedMember && bankInfo ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex h-full w-full flex-col items-center justify-center bg-surface p-8 text-center">
            <div className="bg-white p-4 border brutal-border mb-4">
              <img src={qrUrl} alt="VietQR" className="max-w-[250px] mix-blend-multiply" />
            </div>
            <div className="border brutal-border bg-accent px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-widest text-text-main">Scan to Pay {selectedMember.name}</div>
            <div className="mt-4 font-mono text-[10px] font-bold text-text-muted">
              Bank: {BANKS.find(b => b.id === bankInfo.bankId)?.shortName || bankInfo.bankId}
            </div>
            {bankInfo.accountName && (
              <div className="mt-1 font-mono text-[10px] text-text-muted">
                {bankInfo.accountName}
              </div>
            )}
          </motion.div>
        ) : (
          <div className="text-center opacity-40">
            <ScanLine size={80} className="mx-auto mb-4 text-text-main" />
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-text-main">QR GENERATOR IDLE</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PendingRequestsList() {
  const { financeRequests, approveFinanceRequest, rejectFinanceRequest } = useStore();
  const [selectedReq, setSelectedReq] = useState<FinanceRequest | null>(null);

  const pendingRequests = financeRequests.filter(r => r.status === 'pending');

  if (pendingRequests.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center border brutal-border bg-surface text-xs font-mono uppercase tracking-widest text-text-muted">
        No pending requests
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingRequests.map(req => (
        <div key={req.id} className="group flex items-center justify-between border brutal-border bg-surface p-6 transition-colors hover:bg-main-bg">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-accent px-2 py-1 text-sm font-mono font-bold text-text-main border brutal-border">{parseInt(req.amount).toLocaleString()} VND</span>
              <span className="border brutal-border bg-main-bg px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-text-muted">{req.date}</span>
            </div>
            <p className="font-display font-bold text-text-main">{req.reason}</p>
            <p className="mt-1 text-[10px] font-mono font-bold uppercase tracking-widest text-text-muted">From: {req.requesterName}</p>
          </div>

          <button
            onClick={() => setSelectedReq(req)}
            className="border brutal-border bg-main-bg p-3 text-text-main transition-colors hover:bg-primary hover:text-main-bg"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      ))}

      {selectedReq && (
        <ApprovalModal
          request={selectedReq}
          onClose={() => setSelectedReq(null)}
          onApprove={() => { approveFinanceRequest(selectedReq.id); setSelectedReq(null); }}
          onReject={() => { rejectFinanceRequest(selectedReq.id); setSelectedReq(null); }}
        />
      )}
    </div>
  );
}

function ApprovalModal({ request, onClose, onApprove, onReject }: { request: FinanceRequest, onClose: () => void, onApprove: () => void, onReject: () => void }) {
  const { members } = useStore();
  const [showQR, setShowQR] = useState(false);

  const requester = members.find(m => m.id === request.requesterId);

  const rawBankInfo = requester ? (requester.bankInfo || (requester as any).bank_info) : null;

  const requesterBankInfo = rawBankInfo ? {
    bankId: rawBankInfo.bankId || (rawBankInfo as any).bank_id,
    accountNo: rawBankInfo.accountNo || (rawBankInfo as any).account_no,
    accountName: rawBankInfo.accountName || (rawBankInfo as any).account_name
  } : null;

  const DEFAULT_ACCOUNT_NO = "0356616096";
  const DEFAULT_BANK_ID = "970422";
  const DEFAULT_NAME = "DUT SUPERTEAM";

  const bankId = requesterBankInfo?.bankId || DEFAULT_BANK_ID;
  const accountNo = requesterBankInfo?.accountNo || DEFAULT_ACCOUNT_NO;
  const accountName = requesterBankInfo?.accountName || (requester ? requester.name : DEFAULT_NAME);
  const bankName = BANKS.find(b => b.id === bankId)?.shortName || 'Unknown Bank';

  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${request.amount}&addInfo=${encodeURIComponent(request.reason)}&accountName=${encodeURIComponent(accountName)}`;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-main-bg/80 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 grid w-full max-w-2xl grid-cols-1 gap-8 border brutal-border bg-surface p-8 md:grid-cols-2 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h3 className="mb-6 font-display text-xl font-bold uppercase tracking-wider text-text-main">Review Request</h3>
          <div className="space-y-4 text-xs font-mono">
            <div className="flex justify-between border-b brutal-border pb-2">
              <span className="uppercase tracking-widest text-text-muted">Amount</span>
              <span className="font-bold text-text-main">{parseInt(request.amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b brutal-border pb-2">
              <span className="uppercase tracking-widest text-text-muted">From</span>
              <span className="text-text-main">{request.requesterName}</span>
            </div>
            <div className="flex justify-between border-b brutal-border pb-2">
              <span className="uppercase tracking-widest text-text-muted">Bank</span>
              <span className="text-primary">{bankName}</span>
            </div>
            <div className="flex justify-between border-b brutal-border pb-2">
              <span className="uppercase tracking-widest text-text-muted">Account No</span>
              <span className="text-text-main">{accountNo}</span>
            </div>
            <div>
              <span className="mb-2 block uppercase tracking-widest text-text-muted">Reason</span>
              <p className="border brutal-border bg-main-bg p-3 text-[10px] text-text-main">{request.reason}</p>
            </div>
          </div>

          {!showQR && (
            <div className="grid grid-cols-2 gap-4 mt-8">
              <button onClick={onReject} className="border brutal-border bg-main-bg py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-error transition-colors hover:bg-error hover:text-main-bg">Reject</button>
              <button onClick={() => setShowQR(true)} className="border brutal-border bg-primary py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-main-bg transition-colors hover:opacity-90">Transfer</button>
            </div>
          )}
        </div>

        <div className="relative flex flex-col items-center justify-center overflow-hidden border brutal-border bg-main-bg p-4">
          {showQR ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center w-full">
              <div className="bg-white p-2 border brutal-border mb-4 inline-block">
                 <img src={qrUrl} className="w-full mix-blend-multiply max-w-[200px]" alt="VietQR" />
              </div>
              <button onClick={onApprove} className="w-full border brutal-border bg-text-main py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-main-bg transition-colors hover:bg-primary">Confirm & Approve</button>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center text-center text-text-muted">
              <ScanLine size={48} />
              <p className="mt-4 text-[10px] font-mono font-bold uppercase tracking-widest">Awaiting transfer init</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

function HistoryList() {
  const { financeHistory } = useStore();

  return (
    <div className="space-y-4">
      <div className="mb-6 border brutal-border bg-accent p-4">
        <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-main leading-relaxed">
          <span className="font-display text-sm mr-2 block mb-1">Public ledger:</span> All approved or rejected transactions are stored here to ensure transparency.
        </p>
      </div>

      <div className="grid grid-cols-4 px-4 mb-2 text-[10px] font-mono font-bold uppercase tracking-widest text-text-muted border-b brutal-border pb-2">
        <span>Status</span>
        <span>Amount (VND)</span>
        <span>Reason</span>
        <span className="text-right">Date</span>
      </div>
      <div className="flex flex-col gap-2">
        {financeHistory.map(req => (
          <div key={req.id} className="grid grid-cols-4 items-center border brutal-border bg-surface p-4 text-xs font-mono transition-colors hover:bg-main-bg">
            <div>
              {req.status === 'completed' ? (
                <span className="flex items-center gap-1 font-bold uppercase tracking-widest text-success"><Check size={12} /> Paid</span>
              ) : (
                 <span className="flex items-center gap-1 font-bold uppercase tracking-widest text-error"><X size={12} /> Rejected</span>
              )}
            </div>
            <div className="font-bold text-text-main">{parseInt(req.amount).toLocaleString()}</div>
            <div className="truncate pr-2 text-text-muted">{req.reason}</div>
            <div className="text-right text-[10px] text-text-muted">{req.date}</div>
          </div>
        ))}
        {financeHistory.length === 0 && (
          <div className="border brutal-border bg-surface py-10 text-center text-[10px] font-mono font-bold uppercase tracking-widest text-text-muted">No transaction history</div>
        )}
      </div>
    </div>
  );
}
