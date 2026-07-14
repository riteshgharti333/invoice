import { prisma } from "../../database/client";

export class CategoryRepository {
  async findMany() {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { services: true },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        services: true,
      },
    });
  }

  async findByName(name: string) {
    return prisma.category.findUnique({
      where: { name },
    });
  }

  async create(data: {
    name: string;
    description?: string;
  }) {
    return prisma.category.create({
      data,
    });
  }

  async update(id: string, data: {
    name?: string;
    description?: string;
  }) {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  }
}

export const categoryRepository = new CategoryRepository();