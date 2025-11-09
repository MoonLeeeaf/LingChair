docker stop lingchair
docker rm lingchair
docker rmi lingchair
echo "remove success"
git pull
echo "pull success"
docker compose up -d
echo "update success"