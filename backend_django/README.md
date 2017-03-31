# Backend, Django

## Requirements

* django 1.10
* django rest framework
* python 3


## Installation

### Requirements Installation:
* installing django:
```bash
$ sudo pip3 install django
```
* installing rest framework:
```bash
$ pip install djangorestframework
```

### follow these steps in order to run server.
1. clone the repo.
2. open setting.py file in gatherBackEnd diectory and change DATABASES section base on you database settings.
3. create a database named "gather" (or whatever you have changed it to).
4. make migrations to database by:
```bash
$ python3 manage.py makemigrations
```
5. migrate changes to database by:
```bash
$ python3 manage.py migrate.
```
* if no problem occures, then your database is set up for usage.

## Usage

* create a superuser so you can create and change objects:
```bash
$ python3 manage.py createsuperuser
```

* run the server:
```bash
$ python3 manage.py runserver
```
* open server url in browser and go to admin page, for example:
```bash
localhost:8000/admin
```
* add some objects like competitions base on what you want and documentation.

## Documentation

brief explainations about models and views are added as comment in code files view.py and models.py

