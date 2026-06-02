import PaymentTransactionsTable from "../../components/PaymentTransactionsTable";
import { endpoints } from "../../configs/Apis";

const AdminPayments = () => {
    return <PaymentTransactionsTable
        title="Quản lý giao dịch"
        listEndpoint={endpoints["admin-payments"]}
        countEndpoint={endpoints["admin-payments-count"]}
        markPaidEndpoint={endpoints["admin-mark-payment-paid"]}
        showFilters
        canMarkPaid
    />;
};

export default AdminPayments;
