import { Router} from ".Routes/ttt.ts";
import { Application } from "./dependencies/dependencias.ts";
import { oakCors } from "./dependencies/dependencias.ts";


const app = new Application();

app.use(oakCors({
    origin: Deno.env.get("FRONTEND_URL"),
    credentials: true,
}));


const routes = [Router];

routes.forEach(router =>{
    app.use(router.routes());
    app.use(router.allowedMethods());
})

const puerto = Number(Deno.env.get("PORT") ?? "8000");
console.log(`Servidor corriendo por el puerto ${puerto}`);
app.listen({ port: puerto });
