clean:
	rm -rf dist

build:
	yarn build

docker-stage:
	docker build -t block-chain-api:stage .

docker:
	docker build -t block-chain-api:latest .
