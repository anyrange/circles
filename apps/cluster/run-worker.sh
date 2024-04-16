if [[ -z "${PORT}" ]]; then
  OUTER_PORT=80
else
  OUTER_PORT=$PORT
fi

if [[ -z "$DOCKER_IMAGE" ]]; then
  echo "DOCKER_IMAGE env is not set"
  exit 0
fi

docker run -d --name worker-$OUTER_PORT -p $OUTER_PORT:4000 $DOCKER_IMAGE
