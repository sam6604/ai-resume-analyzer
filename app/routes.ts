<<<<<<< Updated upstream
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("/upload", "routes/upload.tsx"),
    route("/resume/:id", "routes/resume.tsx"),
    route("/wipe", "routes/wipe.tsx"),
=======
import {type RouteConfig, index, route} from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route('/auth', 'routes/auth.tsx'),
    route('/upload', 'routes/upload.tsx'),
    route('/resume/:id', 'routes/resume.tsx'),
    route('/wipe', 'routes/wipe.tsx'),
>>>>>>> Stashed changes
] satisfies RouteConfig;
