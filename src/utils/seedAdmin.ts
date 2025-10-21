import { env } from "../configs/env";
import { UserRole } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import bcrypt from "bcrypt";
import { WalletService } from "../modules/wallet/wallet.service";

export async function seedAdmin() {
  try {
    // check if an Admin already exists
    const existingAdmin = await User.findOne({
      $and: [{ role: UserRole.ADMIN }, { email: env.ADMIN_EMAIL }],
    });
    if (existingAdmin) {
      console.log("✅ Admin already exists.");
      return;
    }

    // hash password
    const hashedPassword = await bcrypt.hash(
      env.ADMIN_PASSWORD,
      Number(env.BCRYPT_SALT)
    );

    // create admin
    const admin = await User.create({
      name: env.ADMIN_NAME,
      email: env.ADMIN_EMAIL,
      phone: env.ADMIN_PHONE,
      password: hashedPassword,
      role: UserRole.ADMIN,
      nid: env.ADMIN_NID,
      dateOfBirth: env.ADMIN_BIRTH,
      isVerified: true,
    });
    await WalletService.createWallet(admin._id, admin.email);
    // strip sensitive fields before logging/returning
    const { password, _id, ...safeAdmin } = admin.toObject();

    console.log("🚀 Admin seeded successfully.");
    return safeAdmin;
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    throw error;
  }
}
