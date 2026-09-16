import { router} from "./Routes/routes_1.ts";
import { Application } from "./dependencies/dependencias.ts";
import { oakCors } from "./dependencies/dependencias.ts";


const app = new Application();

app.use(oakCors({
    origin: Deno.env.get("FRONTEND_URL"),
    credentials: true,
}));


const routes = [router];

routes.forEach(router =>{
    app.use(router.routes());
    app.use(router.allowedMethods());
})

const puerto = Number(Deno.env.get("PORT") ?? "8050");
console.log(`Servidor corriendo por el puerto ${puerto}`);
app.listen({ port: puerto });
