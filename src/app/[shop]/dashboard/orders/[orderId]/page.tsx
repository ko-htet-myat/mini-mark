import { notFound } from "next/navigation";
import { getShopBySlug } from "@/features/shop/data/get-shop";
import { getOrderById } from "@/features/dashboard-orders/data/orders.queries";
import { OrderDetailsView } from "@/features/dashboard-orders/components/order-details-view";

interface OrderDetailsPageProps {
  params: Promise<{ shop: string; orderId: string }>;
}

export default async function OrderDetailsPage({
  params,
}: OrderDetailsPageProps) {
  const { shop: slug, orderId } = await params;
  const shop = await getShopBySlug(slug);

  const order = await getOrderById(shop.id, orderId);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">
        Order Details: {order.orderNumber}
      </h1>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <OrderDetailsView order={order as any} shopSlug={slug} />
    </div>
  );
}
