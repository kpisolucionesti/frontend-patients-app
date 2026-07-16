import React from "react";
import CaseDetailModal from "../Emergency/CaseDetailModal";

const HistoryDetailModal = ({ open, emergencyId, onClose }) => (
    <CaseDetailModal open={open} emergencyId={emergencyId} onClose={onClose} readOnly />
);

export default HistoryDetailModal;
