from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

filmes = []

@app.route('/')
def base():
    return render_template('base.html')

@app.route('/cadastro')
def cadastro():
    return render_template('cadastro.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/inicio')
def inicio():
    return render_template('inicio.html', filmes=filmes)

@app.route('/inicio', methods=['POST'])
def comeco():
    titulo = request.form.get('titulo')
    genero = request.form.get('genero')
    ano = request.form.get('ano')

    filmes.append({
        'titulo': titulo,
        'genero': genero,
        'ano': ano
    })

    return redirect(url_for('inicio'))