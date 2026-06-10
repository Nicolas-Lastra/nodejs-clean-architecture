# Clean Architecture en proyecto de Node.js
Este proyecto utiliza los conocimientos proporcionados por el [curso de Node.js](https://github.com/midudev/curso-node-js/tree/main) dictado por [midudev](https://midu.dev/). Es una versión personal que fusiona las clases de [conexión a base de datos](https://github.com/midudev/curso-node-js/tree/main/clase-5) y [autenticación de usuario](https://github.com/midudev/curso-node-js/tree/main/clase-7), con una visión personal de cómo aplicar clean architecture.

## Clean Architecture
Es un tipo de arquitectura de software que organiza un sistema en capas concéntricas. El núcleo contiene las entidades del dominio y las reglas de negocio. Las capas externas contienen frameworks, bases de datos e Interfaces Gráficas (UI). Su objetivo es estructurar un sistema de manera tal que la lógica de negocio sea independiente de las decisiones técnicas.

![The Clean Architecture By Robert C. Martin](https://blog.cleancoder.com/uncle-bob/images/2012-08-13-the-clean-architecture/CleanArchitecture.jpg)
*The Clean Architecture By Robert C. Martin*

La arquitectura limpia se basa en la regla de dependencia (Dependency Rule), la cual plantea que las dependencias del codigo fuente pueden apuntar solamente hacia adentro. Nada en una capa interior puede saber algo acerca de lo que hay en capas exteriores, esto en código se traduce a que cualquier cosa declarada en una capa exterior no debe mencionarse en capas internas (funciones, clases, variables, etc.).

Este tipo de arquitectura desacopla las responsabilidades. El dominio (entidades, lógica de negocio, casos de uso) es pura lógica con cero dependencias en frameworks. La base de datos, framework web e interfaz gráfica son solo detalles que pueden cambiar sin tocar el núcleo.

### Capas
#### Entidades
Las entidades encapsulan los niveles más altos de las reglas de negocio. No son filas de una base de datos o DTOs, son objetos que representan conceptos que existirían aún si no hay software.

Una entidad puede tener propiedades y métodos, conoce acerca de las reglas de negocio, pero nada acerca de persistencia o HTTP.

Esto en código puede representarse a través de una clase con solamente lógica de negocio, sin dependencias (las clases son plantillas que se utilizan para instanciar entidades). Las entidades son las partes más estables del sistema, suelen cambiar poco o nada.

```javascript
// Estructura típica de una clase en JavaScript
export class User {
  // Propiedades privadas #
  #id
  #username
  #passwordHash
  #email

  constructor ({ id, username, passwordHash, email }) {
    if (!id) throw new Error('User id is required')
    if (!username) throw new Error('Username is required')
    if (!passwordHash) throw new Error('Password hash is required')
    if (!email) throw new Error('Email es required')

    this.#id = id
    this.#username = username
    this.#passwordHash = passwordHash
    this.#email = email
  }

  // getters
  get id () {
    return this.#id
  }

  get username () {
    return this.#username
  }

  get passwordHash () {
    return this.#passwordHash
  }

  get email () {
    return this.#email
  }

  // Métodos o funciones
  toPrimitives () {
    return {
      id: this.#id,
      username: this.#username,
      passwordHash: this.#passwordHash,
      email: this.#email
    }
  }

  toPublicData () {
    return {
      id: this.#id,
      username: this.#username,
      email: this.#email
    }
  }
}

```

#### Casos de uso
Son aplicaciones específicas de las reglas de negocio, orquestan el flujo de datos desde y hacia las entidades. En aplicaciones es común hacer la analogía de casos de uso con los "*Servicios*", no son estrictamente lo mismo pero pueden entenderse como un conjunto de casos de uso.

Los casos de uso dependen directamente de las entidades, pero también deben interactuar con la capa de adaptadores (Interface Adapters), ya que la lógica de negocio indica acciones como persistencia en base de datos, pero sin conocer los detalles. Para lograr esto, y sin depender de implementaciones concretas, se crean dependencias en abstracciones. Estas abstracciones son "planos" o "instrucciones" de cómo utilizar un servicio sin implementarlo.

En el código a continuación tenemos las siguientes abstracciones: userRepository, idGenerator y passwordHasher. El caso de uso importa directamente la entidad (User) y recibe por parámetros (a través del constructor) los adaptadores de interface. Es común que los casos de uso se diseñen para una sola tarea, por eso tiene solo una función llamada execute.

```javascript
import { User } from '../../models/User.js'

export class RegisterUserUseCase {
  constructor ({ userRepository, idGenerator, passwordHasher }) {
    this.userRepository = userRepository
    this.idGenerator = idGenerator
    this.passwordHasher = passwordHasher
  }

  async execute ({ username, password, email }) {
    const existingUser = await this.userRepository.findByUsername(username)
    if (existingUser) throw new Error('Username already exists')

    const id = await this.idGenerator.generate()
    const passwordHash = await this.passwordHasher.hash(password)

    const newUser = new User({
      id,
      username,
      passwordHash,
      email
    })

    await this.userRepository.save(newUser)

    return newUser.toPublicData()
  }
}
```
Como se puede ver en el código anterior, el caso de uso crea una instancia de la entidad User e indica que debe persistirse a través de un repositorio, esta capa no conoce nada acerca de consultas a base de datos (SQL). Aquí userRepository es una abstracción que cumple con un contrato: debe tener un método que reciba un usuario y lo guarde en la base de datos: `this.userRepository.save(newUser)`. Esto se conoce como inversión de dependencia, pero se explicará en otro ejemplo más adelante para evitar confusiones en esta etapa.

#### Adaptadores de Interface
Son un conjunto de adaptadores que convierten los datos desde el formato más conveniente para los casos de uso y entidades, hacia el formato más conveniente para una agencia externa como bases de datos o frameworks web. En esta capa existe toda la arquitectura MVC (Presenters, Views, Controllers). Los modelos solo son estructuras de datos enviadas desde los controladores a los casos de uso, luego son enviados de vuelta desde los casos de uso hacia los presentadores y vistas.

- **Modelos**: Los modelos o "Data Transfer Objects" (DTO) no son lo mismo que una entidad, son una representación de esta para distintos usos. Estrictamente corresponden a estructuras de datos usados para transferir información entre componentes. Los modelos pueden ser de solicitud (objeto transferido del controlador al caso de uso), de respuesta (objeto transferido del caso de uso al presentador) o de vista (objeto que contiene la data exacta que necesita la vista).
- **Vista**: Manejan la presentación de los datos. Representa todo lo que el usuario ve y con lo cual interactua.
- **Controladores**: Manejan el flujo de entrada. Toman las acciones de usuarios desde la vista, los empaquetan y envían hacia los casos de uso.
- **Presentadores**: Manejan el flujo de salida. Obtienen la respuesta desde los casos de uso, la procesan y la envían de vuelta a la vista.
- **Repositorios/Gateaways**: Se encargan específicamente de la persistencia de los datos. Convierten entidades a registros en la base de datos y viceversa. Implementan las interfaces de las cuales dependen los casos de uso.

En este repositorio los presentadores se fusionan con los controladores, por lo que el manejo de datos tanto de entrada como de salida en esta capa será a través de controladores. La carpeta models contiene a las entidades, la estructura de datos para cada entidad es manejada por los controladores y repositorios (JSON). Siendo estrictos con la arquitectura limpia, debiera agregarse un mapeo entre los DTO y las entidades (algo como UserToDto o DtoToUser), pero por ahora se ha evitado por simplicidad (se evaluará agregarlo en futuras actualizaciones).

```javascript
// Ejemplo AuthController
import { validatePartialUser, validateUser } from '../schemas/User.js'

export class AuthController {
  constructor ({ registerUserUseCase, loginUserUseCase }) {
    this.registerUserUseCase = registerUserUseCase
    this.loginUserUseCase = loginUserUseCase
  }

  register = async (req, res, next) => {
    const validatedUser = validateUser(req.body)
    if (validatedUser.error) {
      return res.status(422).json({ error: "User couldn't be validated" })
    }
    try {
      const user = await this.registerUserUseCase.execute(validatedUser.data)
      res.status(201).json({ user })
    } catch (error) {
      next(error)
    }
  }

  login = async (req, res, next) => {
    const validatedPartialUser = validatePartialUser(req.body)
    if (validatePartialUser.error) {
      return res.status(422).json({ error: "User couldn't be validated" })
    }

    try {
      const { user, accessToken } = await this.loginUserUseCase.execute(validatedPartialUser.data)
      res
        .cookie('access_token', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 1000 * 60 * 60
        })
        .json({ user })
    } catch (error) {
      next(error)
    }
  }

  logout = async (req, res, next) => {
    try {
      res
        .clearCookie('access_token')
        .json({ message: 'Logout successful' })
    } catch (error) {
      next(error)
    }
  }
}

```

En el código anterior podemos ver que el controlador se encarga de procesar las solicitudes y respuestas HTTP (req, res), su labor es traducir lo que recibe del mundo exterior, traducirlo para las capas internas y viceversa. Aquí viven las validaciones de esquemas, respuestas con códigos de estado HTTP, solicitud de cookies y sesiones.

También podemos notar como el controlador recibe los casos de uso a través del constructor. Siendo estrictos con la arquitectura limpia, el controlador debería importar directamente el caso de uso. Sin embargo, aquí ocurre lo que se llama inversión de dependencia: tanto las capas de alto nivel (lógica de negocio) como las de de bajo nivel (bases de datos, APIs) deben depender de abstracciones (interfaces), de esta manera también se pueden cambiar las herramientas de bajo nivel.

Las interfaces son un acuerdo escrito de cómo deben estar diseñados estos adaptadores para poder comunicarse debidamente con los casos de uso.

```javascript
// Ejemplo de interfaz/contrato para UserRepository
export class UserRepository {
  async findByUsername (username) {
    throw new Error('Method not implemented')
  }

  async findById (id) {
    throw new Error('Method not implemented')
  }

  async save (user) {
    throw new Error('Method not implemented')
  }
}
```
JavaScript no tiene funcionalidades como las de Java u otros lenguajes para definir interfaces, los cuales arrojan errores si los contratos no están debidamente implementados. En JavaScript se puede simular este comportamiento a través de clases base que contienen especificaciones sin implementación. A partir de este contrato se crearan clases específicas que extiendan/implementen la interfaz/contrato en la capa de Frameworks & Drivers, y hagan implementaciones concretas en el código, como por ejemplo, consultas SQL.

#### Frameworks & Drivers
Es la capa más externa, incluye todas las herramientas externas y detalles técnicos, como la base de datos, framework web, APIs de terceros e interfaz de usuario.

En este repositorio el framework utilizado es Express (servidor con distintas rutas), la base de datos local (sqlite-db.db) y la implementación del repositorio a un caso específico (SQLite), el cual tendrá el código de las consultas en el lenguaje de la base de datos. Por el momento la vista se simula con el archivo [api.http](api.http), en el cual se pueden escribir las peticiones y ver las respuestas del servidor en una ventana aparte.

En esta capa no se suele escribir mucho código más que el código "pegamento" para comunicar a las distintas capas, y lo podemos notar en el archivo app.js de este repositorio.

```javascript
// app.js
import express, { json } from 'express'
import cookieParser from 'cookie-parser'
import 'dotenv/config'

// Auth
import { createAuthMiddleware } from './middlewares/authMiddleware.js'
import { createAuthRouter } from './routes/auth.routes.js'
import { AuthController } from './controllers/AuthController.js'
import { RegisterUserUseCase } from './services/auth/RegisterUserUseCase.js'
import { LoginUserUseCase } from './services/auth/LoginUserUseCase.js'
import { IdGenerator } from './utils/IdGenerator.js'
import { PasswordHasher } from './utils/PasswordHasher.js'
import { TokenService } from './utils/TokenService.js'
import { corsMiddleware } from './middlewares/corsMiddleware.js'

// Movies
// .
// .
// .

export const createApp = ({ userRepository, moviesRepository }) => {
  const app = express()

  // Middlewares
  app.use(json())
  app.use(corsMiddleware())
  app.use(cookieParser())

  // Config
  app.disable('x-powered-by')

  // Dependencies
  const idGenerator = new IdGenerator()
  const saltRounds = parseInt(process.env.SALT_ROUNDS) ?? 10
  const passwordHasher = new PasswordHasher({ saltRounds })
  const tokenService = new TokenService({ secret: process.env.SECRET_JWT_KEY, expiresIn: process.env.EXPIRES_IN })
  const authMiddleware = createAuthMiddleware({ tokenService })

  // Auth Use cases
  const registerUserUseCase = new RegisterUserUseCase({ userRepository, idGenerator, passwordHasher })
  const loginUserUseCase = new LoginUserUseCase({ userRepository, passwordHasher, tokenService })

  // Auth Controllers
  const authController = new AuthController({ registerUserUseCase, loginUserUseCase })
  const authRouter = createAuthRouter({ authController, authMiddleware })

  // Movies Use Cases
  // .
  // .
  // .

  // Movies controllers
  // .
  // .
  // .

  app.get('/', (req, res) => {
    res.json({ message: 'Holanda!' })
  })

  app.use('/auth', authRouter)
  app.use('/movies', moviesRouter)

  return app
}
```

En el código anterior podemos notar que se importan todos los casos de uso y se instancian con sus respectivas dependencias. De manera similar, los controladores también se instancian y se le inyectan los casos de uso previamente instanciados.

En el caso de este repositorio, como no se planea cambiar nada más que el tipo de base de datos utilizada, se agrega un nivel extra por sobre el archivo app.js, el cuál es el archivo [server-with-sqlite.js](server-with-sqlite.js). En este archivo es donde se indica qué tipo de repositorio se va a utilizar e inicia la aplicación.

```javascript
import { createApp } from './app.js'
import { MoviesRepository } from './repositories/sqlite/MoviesRepository.js'
import { UserRepository } from './repositories/sqlite/UserRepository.js'
import 'dotenv/config'

const userRepository = new UserRepository()
await userRepository.init()

const moviesRepository = new MoviesRepository()
await moviesRepository.init()

const app = createApp({ userRepository, moviesRepository })

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
```

#### Referencias
- [The Clean Code Blog by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Clean Architecture: The Dependency Rule and Concentric Layers](https://bitloops.com/resources/software-architecture/clean-architecture)

## Dependencias
Para replicar este proyecto desde cero, instalar:
- Express para la creación de la API: `pnpm install express -E`
- Standard para corrección de código: `pnpm install standard -D -E`
- Zod para validaciones: `pnpm install zod -E`
- Dotenv para leer variables de entorno: `pnpm install dotenv -E`
- libsql para conectar con base de datos SQLite: `pnpm install @libsql/client -E`
- bcrypt para codificar contraseñas en hash: `pnpm install bcrypt -E`
- Json Web Tokens: `pnpm install jsonwebtoken -E`
- Cookies: `pnpm install cookie-parser -E`
- Cors middleware para respuestas con cabeceras cors: `pnpm install cors -E`

## Ejecución
Si clonaste este repositorio, ejecutar en una terminal bash:
```bash
pnpm install
```
Recuerda crear las variables de entorno (.env) en la raíz del proyecto, puedes basarte en [example.env](example.env).

Para ejecutar la aplicación:
```bash
pnpm run start:sqlite
```

## Otros
Este repositorio fue creado para ejecutarse son una base de datos [Turso](https://turso.tech/) o una base de datos local con SQLite. Para agregar otra base de datos u otro lenguaje, replicar lo realizado con los repositorios de este proyecto y crear un archivo .env basado en [example.env](example.env).

Por un problema de compatibilidad entre la versión 10 o superior de pnpm y la extensión ESLint (microsoft) en Visual Studio Code, se agrega un archivo [.npmrc](.npmrc) para arreglar este problema. Esto puede no ser necesario en tu caso, pero si presentas errores de eslinter considera dejarlo.