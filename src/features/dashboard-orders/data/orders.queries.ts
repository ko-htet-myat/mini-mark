import { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export async function getOrders({
  shopId,
  page = 1,
  pageSize = 20,
  status,
  paymentStatus,
  query,
}: {
  shopId: string;
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  query?: string;
}) {
  const where: Prisma.OrderWhereInput = {
    shopId,
    ...(status ? { status } : {}),
    ...(paymentStatus ? { paymentStatus } : {}),
  };

  if (query) {
    where.OR = [
      { orderNumber: { contains: query, mode: "insensitive" } },
      { customerName: { contains: query, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
      skip: page * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ]);

  const pageCount = Math.ceil(total / pageSize);

  return { data, total, pageCount };
}

export async function getOrderById(shopId: string, orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId, shopId },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });
}
