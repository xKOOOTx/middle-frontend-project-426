import "@typespec/http";

using Http;

@service(#{ title: "PC Shop API" })
@route("/api")
namespace PcShop;

/** Целая сумма в рублях, без копеек — в магазине одна валюта. */
@minValue(0)
scalar Money extends int32;

model HealthStatus {
  status: "ok";
}

@route("/health")
namespace Health {
  @get
  op check():
    | { @statusCode statusCode: 200; @body body: HealthStatus }
    | { @statusCode statusCode: 500; @body error: ApiError };
}

model RegisterRequest {
    /** Грубая проверка вида local(собака/at)domain.tld — не полный RFC 5322, ловит только явный мусор. */
    @pattern("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
    email: string;

    @minLength(8)
    password: string
}

model LoginRequest {
    /** Грубая проверка вида local(собака/at)domain.tld — не полный RFC 5322, ловит только явный мусор. */
    @pattern("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
    email: string;

    password: string
}

model User {
    id: int32;
    email: string;
    createdAt: utcDateTime
}

@route("/auth")
namespace Auth {
    @route("/register")
    @post
    op register(@body body: RegisterRequest):
        | { @statusCode statusCode: 201; @body user: User }
        | { @statusCode statusCode: 400; @body error: ApiError }
        | { @statusCode statusCode: 409; @body error: ApiError };

    @route("/login")
    @post
    op login(@body body: LoginRequest):
        | { @statusCode statusCode: 200; @body user: User }
        | { @statusCode statusCode: 401; @body error: ApiError };

    @route("/logout")
    @post
    op logout(): { @statusCode statusCode: 204 };

    @route("/me")
    @get
    op me():
        | { @statusCode statusCode: 200; @body user: User }
        | { @statusCode statusCode: 401; @body error: ApiError };
}

/** Единый формат ошибки для всех ресурсов API. */
@error
model ApiError {
  code: string;
  message: string;
  details?: Record<unknown>;
}