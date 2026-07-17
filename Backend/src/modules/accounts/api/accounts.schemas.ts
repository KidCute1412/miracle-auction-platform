import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const registerPost = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    full_name: Joi.string().min(5).max(50).required().messages({
      "string.empty": "Vui lòng nhập họ tên!",
      "string.min": "Họ tên phải có ít nhất 5 ký tự!",
      "string.max": "Họ tên không được vượt quá 50 ký tự!",
    }),
    email: Joi.string().email().required().messages({
      "string.empty": "Vui lòng nhập email của bạn!",
      "string.email": "Email không đúng định dạng!",
    }),
    address: Joi.string().allow(""),
    password: Joi.string()
      .required()
      .min(8)
      .custom((value, helpers) => {
        if (!/[A-Z]/.test(value)) {
          return helpers.error("password.uppercase");
        }
        if (!/[a-z]/.test(value)) {
          return helpers.error("password.lowercase");
        }
        if (!/\d/.test(value)) {
          return helpers.error("password.digital");
        }
        if (!/[@$!%*?&]/.test(value)) {
          return helpers.error("password.specialCharacter");
        }

        return value;
      })
      .messages({
        "string.empty": "Vui lòng nhập mật khẩu!",
        "string.min": "Mật khẩu phải chứa ít nhất 8 ký tự!",
        "password.uppercase": "Mật khẩu phải chứa ít nhất một chữ cái in hoa!",
        "password.lowercase": "Mật khẩu phải chứa ít nhất một chữ cái thường!",
        "password.digital": "Mật khẩu phải chứa ít nhất một chữ số!",
        "password.specialCharacter": "Mật khẩu phải chứa ít nhất một ký tự đặc biệt!",
      }),

    agree: Joi.boolean().valid(true).messages({
      "any.only": "Bạn phải đồng ý với các điều khoản và điều kiện!",
    }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    const errorMessage = error.details[0].message;
    return res.json({
      code: "error",
      message: errorMessage,
    });
  }

  next();
};

export const registerVerifyPost = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    otp: Joi.string().required().messages({
      "string.empty": "Vui lòng nhập mã otp!",
    }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    const errorMessage = error.details[0].message;
    return res.json({
      code: "error",
      message: errorMessage,
    });
  }

  next();
};

export const loginPost = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.empty": "Vui lòng nhập email của bạn!",
      "string.email": "Email không đúng định dạng!",
    }),
    password: Joi.string().required().min(8).messages({
      "string.empty": "Vui lòng nhập mật khẩu!",
      "string.min": "Mật khẩu phải ít nhất 8 ký tự!",
    }),
    rememberPassword: Joi.boolean().allow(""), // Cho phép boolean hoặc để trống,
    captchaToken: Joi.string().required().messages({
      "string.empty": "Captcha token is required!",
    }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    const errorMessage = error.details[0].message;
    return res.json({
      code: "error",
      message: errorMessage,
    });
  }

  next();
};

export const forgotPassword = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.empty": "Vui lòng nhập email của bạn!",
      "string.email": "Email không đúng định dạng!",
    }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.json({ code: "error", message: error.details[0].message });
  }
  next();
};

export const forgotPasswordVerify = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    otp: Joi.string().required().messages({
      "string.empty": "Vui lòng nhập mã otp!",
    }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.json({ code: "error", message: error.details[0].message });
  }
  next();
};

export const resetPassword = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.empty": "Vui lòng nhập email của bạn!",
      "string.email": "Email không đúng định dạng!",
    }),
    password: Joi.string().required().min(8).messages({
      "string.empty": "Vui lòng nhập mật khẩu!",
      "string.min": "Mật khẩu phải chứa ít nhất 8 ký tự!",
    }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.json({ code: "error", message: error.details[0].message });
  }
  next();
};

export const changePassword = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    currentPassword: Joi.string().required().messages({
      "string.empty": "Mật khẩu hiện tại không được để trống!",
    }),
    newPassword: Joi.string().required().min(8).messages({
      "string.empty": "Mật khẩu mới không được để trống!",
      "string.min": "Mật khẩu mới phải chứa ít nhất 8 ký tự!",
    }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.json({ code: "error", message: error.details[0].message });
  }
  next();
};

export const verifyChangePassword = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    otp: Joi.string().required().messages({
      "string.empty": "Vui lòng nhập mã otp!",
    }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.json({ code: "error", message: error.details[0].message });
  }
  next();
};

export const googleLoginPost = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    credential: Joi.string().required().messages({
      "string.empty": "Google credential token is required!",
    }),
    rememberMe: Joi.boolean().allow(""),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.json({ code: "error", message: error.details[0].message });
  }
  next();
};
