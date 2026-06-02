import PaymentTransactionsTable from "../../components/PaymentTransactionsTable";
import { endpoints } from "../../configs/Apis";

const ProviderPayments = () => {
    return <PaymentTransactionsTable
        title="Giao dịch dịch vụ"
        listEndpoint={endpoints["provider-payments"]}
        countEndpoint={endpoints["provider-payments-count"]}
        markPaidEndpoint={endpoints["provider-mark-payment-paid"]}
        showFilters
        canMarkPaid
    />;
};

export default ProviderPayments;
