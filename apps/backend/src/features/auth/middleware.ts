import { auth } from "@/lib/auth";
import { fromNodeHeaders } from "better-auth/node";

export const requireAuth = async (req: any, res: any, next: any) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.session = session;
    req.user = session.user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
