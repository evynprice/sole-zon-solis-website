#!/bin/bash
sudo docker stop isolr_nodejs && sudo docker rm isolr_nodejs
sudo docker-compose build
sudo docker-compose up -d