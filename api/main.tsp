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

model Category {
    id: int32;
    slug: string;
    name: string;
}

model Product {
    id: int32;
    slug: string;
    name: string;
    description: string;
    price: Money;
    imageUrl?: string;
    available: boolean;
    categorySlug: string;
}

model ProductList {
    items: Product[];
    total: int32;
    page: int32;
    pageSize: int32;
}

@route("/products")
namespace Products {
    @get
    op list(
        @query category?: string,
        @query priceMin?: Money,
        @query priceMax?: Money,
        @query available?: boolean,
        @query search?: string,
        @query page?: int32,
        @query pageSize?: int32,
    ):
    | { @statusCode statusCode: 200; @body body: ProductList }
    | { @statusCode statusCode: 400; @body error: ApiError };

    @route("/{slug}")
    @get
    op get(@path slug: string):
        | { @statusCode statusCode: 200; @body body: Product }
        | { @statusCode statusCode: 404; @body error: ApiError };
}

@route("/categories")
namespace Categories {
    @get
    op list(): { @statusCode statusCode: 200; @body body: Category[] };
}

model PromoBlockProduct {
    id: int32;
    slug: string;
    name: string;
    price: Money;
    categorySlug: string;
}

model PromoBlock {
    id: int32;
    title: string;
    text: string;
    product: PromoBlockProduct;
}

@route("/promo")
namespace Promo {
    @get
    op list(): { @statusCode statusCode: 200; @body body: PromoBlock[] };
}

/** Единый формат ошибки для всех ресурсов API. */
@error
model ApiError {
  code: string;
  message: string;
  details?: Record<unknown>;
}