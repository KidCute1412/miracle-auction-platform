import { Request, Response } from "express";
import * as UsersService from "../application/user.use-case.ts";

// Fetch paginated user listing
export async function list(req: Request, res: Response) {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const filter = {};
    if (req.query.status) {
      Object.assign(filter, { status: req.query.status });
    }
    if (req.query.search) {
      Object.assign(filter, { search: req.query.search });
    }

    const list = await UsersService.getUsersWithOffsetLimit((page - 1) * limit, limit, filter);
    res.json({
      code: "success",
      message: "Success",
      list,
    });
  } catch (error) {
    res.status(500).json({ code: "error", message: "Server error" });
  }
}

// Calculate total user entries Matching filters
export async function calNumberOfUsers(req: Request, res: Response) {
  try {
    const filter = {};
    if (req.query.search) {
      Object.assign(filter, { search: req.query.search });
    }
    if (req.query.status) {
      Object.assign(filter, { status: req.query.status });
    }

    const total = await UsersService.calTotalUsers(filter);
    res.json({ code: "success", message: "Success", total });
  } catch (error) {
    res.status(500).json({ code: "error", message: "Server error" });
  }
}

// Fetch single user detail
export async function detail(req: Request, res: Response) {
  try {
    const user_id = Number(req.params.id);
    const user = await UsersService.getUserById(user_id);
    if (!user) {
      return res.status(404).json({ code: "error", message: "User does not exist" });
    }
    res.json({ code: "success", message: "Success", user });
  } catch (error) {
    res.status(500).json({ code: "error", message: "Server error" });
  }
}

// Edit role and status tags of user
export async function editRole(req: Request, res: Response) {
  try {
    const user_id = Number(req.params.id);
    const { role, status } = req.body;
    const user = await UsersService.getUserById(user_id);
    if (!user) {
      return res.status(404).json({ code: "error", message: "User does not exist" });
    }
    await UsersService.editUserRoleAndStatus(user_id, role, status);
    res.json({ code: "success", message: "Role updated successfully" });
  } catch (error) {
    res.status(500).json({ code: "error", message: "Server error" });
  }
}

// Reset user password and alert via email notification
export async function resetPassword(req: Request, res: Response) {
  try {
    const user_id = Number(req.params.id);
    const success = await UsersService.resetUserPassword(user_id);
    if (!success) {
      return res.status(404).json({ code: "error", message: "User does not exist" });
    }
    res.json({ code: "success", message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ code: "error", message: "Server error" });
  }
}

// Fetch all seller applications list with user detailed info
export async function applications(req: Request, res: Response) {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const filter = {};
    if (req.query.status) {
      Object.assign(filter, { status: req.query.status });
    }
    if (req.query.dateFrom) {
      Object.assign(filter, { dateFrom: req.query.dateFrom });
    }
    if (req.query.dateTo) {
      Object.assign(filter, { dateTo: req.query.dateTo });
    }
    if (req.query.search) {
      Object.assign(filter, { search: req.query.search });
    }
    const list = await UsersService.getSellerApplicationsDetailed(page, limit, filter);
    res.json({ code: "success", message: "Success", list });
  } catch (error) {
    res.status(500).json({ code: "error", message: "Server error" });
  }
}

// Fetch single application form detail
export async function applicationDetail(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const applicationInfo = await UsersService.getSellerApplicationByIdDetailed(id);
    if (!applicationInfo) {
      return res.status(404).json({ code: "error", message: "Application details do not exist" });
    }
    res.json({
      code: "success",
      message: "Success",
      applicationInfo,
    });
  } catch (error) {
    res.status(500).json({ code: "error", message: "Application details do not exist" });
  }
}

// Approve or reject application form status
export async function setStatus(req: Request, res: Response) {
  try {
    const applicationId = Number(req.params.id);
    const { status } = req.body;
    await UsersService.setApplicationStatus(applicationId, status);
    res.json({ code: "success", message: "Application confirmed successfully" });
  } catch (error) {
    res.status(500).json({ code: "error", message: "Error confirming application" });
  }
}

// Calculate total application count matching filter parameters
export async function calTotalApplications(req: Request, res: Response) {
  try {
    const filter = {};
    if (req.query.status) {
      Object.assign(filter, { status: req.query.status });
    }
    if (req.query.dateFrom) {
      Object.assign(filter, { dateFrom: req.query.dateFrom });
    }
    if (req.query.dateTo) {
      Object.assign(filter, { dateTo: req.query.dateTo });
    }
    if (req.query.search) {
      Object.assign(filter, { search: req.query.search });
    }
    const total = await UsersService.calTotalApplications(filter);
    res.json({ code: "success", message: "Success", total });
  } catch (error) {
    res.status(500).json({ code: "error", message: "Server error" });
  }
}
