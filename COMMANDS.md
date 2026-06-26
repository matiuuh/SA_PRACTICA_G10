# FilmStars — Comandos de referencia

## SSH a las VMs

```powershell
# VM de Bases de Datos
ssh -i "C:\Users\estua\.ssh\filmstars_fixed.pem" ubuntu@75.101.181.215

# VM de Develop
ssh -i "C:\Users\estua\.ssh\filmstars_fixed.pem" ubuntu@3.211.105.130

# K3s Master
ssh -i "C:\Users\estua\.ssh\filmstars_fixed.pem" ubuntu@54.91.6.48

# K3s Worker
ssh -i "C:\Users\estua\.ssh\filmstars_fixed.pem" ubuntu@54.211.31.137

# Registry Zot
ssh -i "C:\Users\estua\.ssh\filmstars_fixed.pem" ubuntu@32.194.71.242
```

---

## VM de Bases de Datos (75.101.181.215)

```bash
# Ver contenedores corriendo
sudo docker ps

# Logs de un contenedor
sudo docker logs postgres-auth
sudo docker logs postgres-funciones
sudo docker logs rabbitmq

# Conectarse a una BD
docker exec postgres-auth      psql -U postgres -d auth_service
docker exec postgres-localidades psql -U postgres -d localidades_service
docker exec postgres-funciones psql -U postgres -d funciones_db
docker exec postgres-reservas  psql -U postgres -d reservas_service
docker exec postgres-pagos     psql -U postgres -d pagos_service

# Ver tablas de una BD
\dt

# Salir de psql
\q

# Reiniciar todos los contenedores de BD
cd /opt/filmstars-db && sudo docker compose restart
```

---

## VM de Develop (3.211.105.130)

```bash
# Ver contenedores
sudo docker ps

# Logs de un servicio
sudo docker logs auth-service --tail 50
sudo docker logs api-gateway --tail 50
sudo docker logs frontend --tail 50

# Reiniciar un servicio
cd /opt/filmstars && sudo docker compose restart auth-service

# Reiniciar todo
cd /opt/filmstars && sudo docker compose up -d --remove-orphans

# Ver .env actual
cat /opt/filmstars/.env

# Ver docker-compose
cat /opt/filmstars/docker-compose.yml
```

---

## K3s — Cluster (desde K3s Master)

```bash
# Ver nodos del cluster
sudo kubectl get nodes

# Ver nodos con detalle (CPU, RAM)
sudo kubectl get nodes -o wide

# Ver todos los pods de la app
sudo kubectl get pods -n filmstars

# Ver pods con mas detalle
sudo kubectl get pods -n filmstars -o wide

# Ver logs de un pod
sudo kubectl logs -n filmstars deployment/auth-service --tail 50

# Describir un pod (ver errores)
sudo kubectl describe pod -n filmstars -l app=auth-service

# Ver servicios
sudo kubectl get services -n filmstars

# Ver ingress
sudo kubectl get ingress -n filmstars

# Ver configmaps
sudo kubectl get configmap -n filmstars

# Ver secrets
sudo kubectl get secrets -n filmstars

# Ver uso de recursos
sudo kubectl top nodes
sudo kubectl top pods -n filmstars

# Reiniciar un deployment
sudo kubectl rollout restart deployment/auth-service -n filmstars

# Ver estado de un rollout
sudo kubectl rollout status deployment/auth-service -n filmstars

# Ver cert-manager (certificados TLS)
sudo kubectl get certificates -n filmstars
sudo kubectl get certificaterequests -n filmstars

# Ver monitoring
sudo kubectl get pods -n monitoring
```

---

## Registry Zot (32.194.71.242)

```bash
# Ver contenedor
sudo docker ps | grep zot

# Logs del registry
sudo docker logs zot-registry --tail 50

# Listar imagenes en el registry
curl -u filmstars:filmstars2026 http://32.194.71.242:5000/v2/_catalog

# Ver tags de una imagen
curl -u filmstars:filmstars2026 http://32.194.71.242:5000/v2/filmstars-auth-service/tags/list
```

---

## Terraform

```powershell
cd terraform/environments/filmstars

# Inicializar
terraform init -backend-config="bucket=filmstars-tf-state-g10" -backend-config="region=us-east-1" -backend-config="dynamodb_table=filmstars-tf-lock"

# Ver IPs actuales
terraform output

# Aplicar cambios
terraform apply -var="aws_region=us-east-1" -var="key_name=filmstars-ec2"

# Destruir todo
terraform destroy -var="aws_region=us-east-1" -var="key_name=filmstars-ec2"
```

---

## Ansible (desde WSL, en directorio ansible/)

```bash
# Configurar VM de BDs
ANSIBLE_ROLES_PATH=./roles ansible-playbook playbooks/configure_db.yml -i inventory/db.ini --private-key ~/.ssh/filmstars_fixed.pem

# Configurar VM de Develop
ANSIBLE_ROLES_PATH=./roles ansible-playbook playbooks/configure_develop.yml -i inventory/develop.ini --private-key ~/.ssh/filmstars_fixed.pem -e "db_host=10.0.1.137 postgres_password=postgres jwt_secret=losgoats rabbitmq_user=guest rabbitmq_pass=guest internal_service_token=a7f3c92b1e4d8f6a2c5e9b0d3f7a1c4e8b2d5f9a0c3e6b1d4f7a2c5e8b0d3f6 dockerhub_username=matiuuh project_root=/mnt/c/Users/estua/OneDrive/Documentos/2026/SA/Practica1/SA_PRACTICA_G10"

# Configurar K3s + Registry
ANSIBLE_ROLES_PATH=./roles ansible-playbook playbooks/configure_release.yml -i inventory/release.ini --private-key ~/.ssh/filmstars_fixed.pem -e "db_host=10.0.1.137 postgres_password=postgres jwt_secret=losgoats rabbitmq_user=guest rabbitmq_pass=guest internal_service_token=a7f3c92b1e4d8f6a2c5e9b0d3f7a1c4e8b2d5f9a0c3e6b1d4f7a2c5e8b0d3f6 registry_ip=32.194.71.242 zot_user=filmstars zot_pass=filmstars2026 grafana_admin_user=admin grafana_admin_password=filmstars2026"
```

---

## Datos iniciales en BD

```bash
# Conectarse a la VM de BDs
ssh -i "C:\Users\estua\.ssh\filmstars_fixed.pem" ubuntu@75.101.181.215

# Tipos de cartelera
docker exec postgres-funciones psql -U postgres -d funciones_db -c "INSERT INTO tipo_cartelera (id_tipo_cartelera, nombre) VALUES (gen_random_uuid(), 'Pre-venta'), (gen_random_uuid(), 'Re-estreno'), (gen_random_uuid(), 'Estreno') ON CONFLICT (nombre) DO NOTHING;"

# Categorias de peliculas
docker exec postgres-funciones psql -U postgres -d funciones_db -c "INSERT INTO categorias (id_categoria, nombre) VALUES (gen_random_uuid(), 'Accion'), (gen_random_uuid(), 'Suspenso'), (gen_random_uuid(), 'Terror'), (gen_random_uuid(), 'Drama') ON CONFLICT (nombre) DO NOTHING;"

# Metodos de pago
docker exec postgres-pagos psql -U postgres -d pagos_service -c "INSERT INTO metodos_pago (id_metodo, nombre) VALUES (gen_random_uuid(), 'TARJETA'), (gen_random_uuid(), 'PAYPAL') ON CONFLICT (nombre) DO NOTHING;"
```

---

## URLs de la aplicacion

| Ambiente | URL |
|----------|-----|
| Develop  | http://3.211.105.130:5173 |
| Release  | https://54.91.6.48.sslip.io |
| Grafana  | http://54.91.6.48:3000 (admin / filmstars2026) |
| RabbitMQ | http://75.101.181.215:15672 (guest / guest) |
| Zot Registry | http://32.194.71.242:5000 |

---

## IPs del proyecto

| Servidor | IP Publica | IP Privada |
|----------|-----------|------------|
| DB VM | 75.101.181.215 | 10.0.1.137 |
| Develop | 3.211.105.130 | — |
| K3s Master | 54.91.6.48 | — |
| K3s Worker | 54.211.31.137 | — |
| Registry Zot | 32.194.71.242 | — |
