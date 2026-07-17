import { prisma } from "@/infrastructure/database/prisma.client.ts";

export type EditProfileInput = {
  user_id: number;
  username?: string;
  email?: string;
  full_name?: string;
  address?: string;
  date_of_birth?: string;
  avatar?: string;
};

// Update the user profile detail row
export async function editUserProfile(data: EditProfileInput) {
  const user = await prisma.users.update({
    where: { user_id: data.user_id },
    data: {
      ...(data.username ? { username: data.username } : {}),
      ...(data.email ? { email: data.email } : {}),
      ...(data.full_name ? { full_name: data.full_name } : {}),
      ...(data.address ? { address: data.address } : {}),
      ...(data.date_of_birth ? { date_of_birth: new Date(data.date_of_birth) } : {}),
      ...(data.avatar ? { avatar: data.avatar } : {}),
    },
  });
  return [user];
}

// Update user authentication role
export async function updateUserRole(user_id: number, role: string) {
  return prisma.users.update({ where: { user_id }, data: { role } });
}

// Fetch user profile detail and identify ownership
export async function getUserProfileDetail(params: {
  username: string;
  user_id: number;
  current_user_id: number | null;
}) {
  const isOwner = params.current_user_id === params.user_id;
  const data = await prisma.users.findFirst({
    where: { username: params.username, user_id: params.user_id },
  });
  if (!data) {
    return null;
  }
  return {
    data,
    is_owner: isOwner,
  };
}
