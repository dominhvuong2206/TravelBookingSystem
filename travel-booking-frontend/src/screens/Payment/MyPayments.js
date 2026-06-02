import PaymentTransactionsTable from "../../components/PaymentTransactionsTable";
import { endpoints } from "../../configs/Apis";

const MyPayments = () => {
    return <PaymentTransactionsTable
        title="Lịch sử giao dịch"
        listEndpoint={endpoints["payments"]}
        countEndpoint={endpoints["payments-count"]}
    />;
};

export default MyPayments;
