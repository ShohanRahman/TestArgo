# Node Express Server

# Docker

Dockerfile is at the root of the repository. It creates the image of the Node Express Server.
The docker-compose create the containers for :

### Mongo

| Variable      | Value |
| ------------- | ----- |
| Port          | 27017 |
| ROOT USERNAME | root  |
| ROOT PASSWORD | root  |
| Volume        | data  |

### Grafana

| Variable | Value                 |
| -------- | --------------------- |
| Image    | grafana/grafana:6.7.3 |
| Port     | 3000                  |

### Jaeger

| Variable                    | Value                         |
| --------------------------- | ----------------------------- |
| **Image**                   | jaegertracing/all-in-one:1.14 |
| **Ports**                   | 14268                         |
|                             | 16686                         |
|                             | 5775                          |
|                             | 6831 / udp                    |
|                             | 6832 / udp                    |
|                             | 9411                          |
| **Environement variable**   |                               |
| COLLECTOR_ZIPKING_HTTP_PORT | 9411                          |

- prometheus

### Prometheus

| Variable | Value           |
| -------- | --------------- |
| Image    | prom/prometheus |
| Port     | 9090            |

# Kubernetes

> Kubernetes is used to launch the service of the API with the Docker Image.

# NodeJS Express Server

- Create a REST API
- Manage Users informations

**The path to access to the API is**

```sh
127.17.0.3:32000
```

## Different endpoints

| HTTP Type | Path                     |
| --------- | ------------------------ |
| GET       | /api/v1/people           |
| POST      | /api/v1/people           |
| GET       | /api/v1/people/:peopleID |
| DELETE    | /api/v1/people/:peopleID |
