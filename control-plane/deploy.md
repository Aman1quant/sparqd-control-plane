# Deploy

## Manual Deployment

### Build Image Locally & Push to ECR

Manual commands to be invoked locally:
```bash
export ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
export REGION=ap-southeast-3
export IMAGE_NAME=mytselsearch/global-search-api
export REPO_URI="${ACCOUNT}.dkr.ecr.ap-southeast-3.amazonaws.com"
export REPO=$REPO_URI/$IMAGE_NAME

# Build local image
sudo docker build -t $IMAGE_NAME --progress=plain -f Dockerfile.dev .

# Login ECR
aws ecr get-login-password --region $REGION | sudo docker login --username AWS --password-stdin $REPO_URI

# Tag: We use semver tagging as later required also in CI/CD
# Hint: use tag incrementally based on latest tag
export VERSION_TAG=0.0.1-rc1

sudo docker tag $IMAGE_NAME:latest $REPO:$VERSION_TAG

# Push
sudo docker push $REPO:$VERSION_TAG
```

### Apply Kubernetes Manifest Manually
Login SSH to bastion machine
```bash
# Create directory for mytselsearch on bastion if not exists
mkdir -p mytselsearch
cd mytselsearch

# Create global-search-api wrapper directory
mkdir -p _global-search-api
cd _global-search-api

# Create manifest directory
mkdir -p manifests
cd manifests
```

__global-search-api-config__

Example:
```yaml
# ~/mytselsearch/_global-search-api/manifests/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: global-search-api-config
  namespace: mytselsearch-api
data:
  CONTEXT_PATH: /mytsel-search
  CORS_ALLOW_CREDENTIALS: "true"
  CORS_ALLOWED_HEADERS: accept,authorization,content-type,user-agent,x-requested-with,x-request-id
  CORS_ALLOWED_METHODS: GET,POST,PUT,DELETE,PATCH
  CORS_ALLOWED_ORIGINS: '*' # update accordingly for security
  CORS_ENABLED: "true"
  CORS_EXPOSED_HEADERS: x-request-id,Date,Content-Length
  CORS_MAX_AGE: "86400"
  CORS_OPTIONS_SUCCESS_STATUS: "200"
  ENABLE_VERTEX_FALLBACK: "true"
  LISTEN_PORT: "3000"
  TZ: Asia/Jakarta
```

__global-search-api-secret__

Example:
```yaml
# ~/mytselsearch/_global-search-api/manifests/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: global-search-api-secret
  namespace: mytselsearch-api
type: Opaque
stringData:
  OPENSEARCH_AUTH_TYPE: "basic"
  OPENSEARCH_PROTOCOL: "https"
  OPENSEARCH_HOST: "UPDATE"
  OPENSEARCH_PORT: "443"
  OPENSEARCH_USERNAME: "UPDATE"
  OPENSEARCH_PASSWORD: "UPDATE"
  REDIS_HOST: "UPDATE"
  REDIS_PORT: "6379"
  REDIS_USERNAME: ""    # Empty by default
  REDIS_PASSWORD: ""    # Empty by default
  VERTEX_SEARCH_TOKEN_CACHE: "UPDATE"
  VERTEX_SEARCH_HOST: "UPDATE"
  VERTEX_SEARCH_TOKEN_SEARCH: "UPDATE"
```

```bash
kubectl -n mytselsearch-api create -f <file>.yaml
kubectl -n mytselsearch-api replace -f <file>.yaml
```

### Install or Upgrade Helm Chart

Clone the Helm chart.
```bash
cd ~/mytselsearch/_global-search-api
git clone https://cicd-gitlab-ee.telkomsel.co.id/telkomsel/itdaml_group/mytsel-search/pipeline-template-assets/global-search-api-cloud-config.git
```

Helm chart available on `helm` directory. Install Helm locally if not yet: https://helm.sh/docs/intro/install/

To render the chart locally:
```bash
cd ~/mytselsearch/_global-search-api/global-search-api-cloud-config/helm
helm template global-search-api .
```

```bash
helm upgrade --install global-search-api . --namespace mytselsearch-api -f values.yaml --wait --atomic
```

To delete/uninstall the Helm release (cleans up all related resources):
```bash
helm uninstall global-search-api -n mytselsearch-api
```

### Inspect Deployments

```bash
# 📦 Get all deployments in a namespace
kubectl -n mytselsearch-api get deployments

# 📄 Describe a specific deployment
kubectl -n mytselsearch-api describe deployment tsel-global-search-api

# 📦 Get pods in a namespace
kubectl -n mytselsearch-api get pods

# 🔍 Describe a pod (e.g., to debug scheduling, image issues, etc.)
kubectl -n mytselsearch-api describe pod <pod-name>

# 📥 Get logs for a pod
kubectl -n mytselsearch-api logs <pod-name>

# If there are multiple containers in the pod:
kubectl -n mytselsearch-api logs <pod-name> -c <container-name>

# ⏳ Stream logs (like tail -f)
kubectl -n mytselsearch-api logs -f <pod-name>

# 🚨 See recent events (e.g. CrashLoopBackOff, image pull errors)
kubectl -n mytselsearch-api get events --sort-by=.metadata.creationTimestamp
```

## CI/CD Deployment
TODO
