import { Role } from "@prisma/client";

import { prisma } from "../../database/client";

export class UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findMany() {
    return prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
    role?: Role;
  }) {
    return prisma.user.create({
      data,
    });
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      email: string;
      password: string;
      role: Role;
    }>
  ) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }
}

export const userRepository = new UserRepository();