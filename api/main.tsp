import "@typespec/http";

using Http;

@service(#{ title: "PC Shop API" })
namespace PcShop;

/** Целая сумма в рублях, без копеек — в магазине одна валюта. */
@minValue(0)
scalar Money extends int32;

/** Единый формат ошибки для всех ресурсов API. */
@error
model ApiError {
  code: string;
  message: string;
  details?: Record<unknown>;
}

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