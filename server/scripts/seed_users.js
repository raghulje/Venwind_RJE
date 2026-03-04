require("dotenv").config();
const bcrypt = require("bcrypt");
const { sequelize, User } = require("../models");

const saltRounds = 10;

async function main() {
  await sequelize.authenticate();
  await sequelize.sync();

  // Create admin user
  const adminPassword = bcrypt.hashSync("admin123", saltRounds);
  const [adminUser] = await User.findOrCreate({
    where: { username: "admin" },
    defaults: {
      username: "admin",
      first_name: "Admin",
      last_name: "User",
      email: "admin@venwind.com",
      password: adminPassword,
      user_type: "Admin",
      is_active: true,
    },
  });

  if (!adminUser.isNewRecord) {
    await adminUser.update({
      password: adminPassword,
      user_type: "Admin",
      is_active: true,
    });
  }

  // Create investors user
  const investorsPassword = bcrypt.hashSync("investors", saltRounds);
  const [investorsUser] = await User.findOrCreate({
    where: { username: "investors" },
    defaults: {
      username: "investors",
      first_name: "Investors",
      last_name: "User",
      email: "investors@venwind.com",
      password: investorsPassword,
      user_type: "Investors",
      is_active: true,
    },
  });

  if (!investorsUser.isNewRecord) {
    await investorsUser.update({
      password: investorsPassword,
      user_type: "Investors",
      is_active: true,
    });
  }

  console.log("✅ Seeded users: admin and investors");
  await sequelize.close();
}

main().catch(async (e) => {
  console.error("❌ Seed failed:", e);
  try { await sequelize.close(); } catch (_) {}
  process.exit(1);
});

