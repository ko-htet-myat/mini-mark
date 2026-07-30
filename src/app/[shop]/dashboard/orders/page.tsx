import { OrdersDataTable } from "@/features/dashboard-orders/components/tables/orders-data-table";
import { getOrders } from "@/features/dashboard-orders/data/orders.queries";
import { getShopBySlug } from "@/features/shop/data/get-shop";
import { parsePagination } from "@/lib/parse-pagination";
import { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";

interface OrdersPageProps {
  params: Promise<{ shop: string }>;
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    query?: string;
    status?: string;
    paymentStatus?: string;
  }>;
}

export default async function OrdersPage({
  params,
  searchParams,
}: OrdersPageProps) {
  const { shop: slug } = await params;
  const sp = await searchParams;
  const shop = await getShopBySlug(slug);

  const { page, pageSize } = parsePagination(sp);
  const queryFilter = sp.query ?? "";

  const statusFilter = sp.status as OrderStatus | undefined;
  const paymentStatusFilter = sp.paymentStatus as PaymentStatus | undefined;

  const { data, total, pageCount } = await getOrders({
    shopId: shop.id,
    page,
    pageSize,
    query: queryFilter,
    status: statusFilter,
    paymentStatus: paymentStatusFilter,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Orders</h1>
      <OrdersDataTable
        data={data.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          total: Number(order.total),
          currency: order.currency,
          status: order.status,
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt,
        }))}
        pageCount={pageCount}
        total={total}
        page={page}
        pageSize={pageSize}
        queryFilter={queryFilter}
        statusFilter={statusFilter ?? null}
        paymentStatusFilter={paymentStatusFilter ?? null}
      />
    </div>
  );
}
