import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import Tenant from "../models/Tenant.js";

export const registerUser = async ({
  fullname,
  email,
  password,
  companyName
}) => {

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  // Create company
  const tenant = await Tenant.create({
    name: companyName
  });

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create admin user
  const user = await User.create({
    fullname,
    email,
    password: hashedPassword,
    tenantId: tenant._id,
    role: "ADMIN"
  });

  return {
    userId: user._id,
    tenantId: tenant._id,
    fullname: user.fullname,
    email: user.email
  };
};

export const loginUser = async ({ email, password }) => {

  const user = await User.findOne({ email })
    .select("+password");

  if (!user || !user.isActive) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    {
      userId: user._id.toString(),
      tenantId: user.tenantId.toString(),
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d"
    }
  );

  return {
    token,
    user: {
      id: user._id,
      fullname: user.fullname,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role
    }
  };
};