from flask import render_template, request, redirect
from flask import url_for, Flask, flash, session
from .db import criar_conexao, inicializar_banco

app = Flask(__name__)
app.config['SECRET_KEY'] = 'hugulei'

inicializar_banco()

@app.route('/', methods=['POST', 'GET'])
def cadastro():

    if 'user' in session:
        return redirect(url_for('home'))

    if request.method == 'POST':
        nome = request.form.get('nome')
        senha = request.form.get('senha')
        confirmar_senha = request.form.get('confirmar_senha')

        if senha != confirmar_senha:
            flash('As senhas não coincidem!')
            return redirect(url_for('cadastro'))

        email = request.form.get('email')

        conexao = criar_conexao()

        resultado = conexao.execute("SELECT * FROM usuarios WHERE nome == ?", (nome,))
        user = resultado.fetchone()

        if not user:
            cursor = conexao.execute(
                "INSERT INTO usuarios(nome, senha, email) VALUES (?,?,?)",
                (nome, senha, email)
            )
            conexao.commit()

            usuario_id = cursor.lastrowid
            conexao.close()

            session['user'] = nome
            session['id'] = usuario_id

            flash(f'Cadastro realizado com sucesso! Bem-vindo, {nome}!')
            return redirect(url_for('home'))
        else:
            conexao.close()
            flash('usuário existente')
            return redirect(url_for('cadastro'))

    return render_template('cadastro.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'user' in session:
        return redirect(url_for('home'))

    if request.method == 'POST':
        email = request.form.get('email')
        senha = request.form.get('senha')

        conexao = criar_conexao()

        resultado = conexao.execute("SELECT * FROM usuarios WHERE email = ?", (email,))
        user = resultado.fetchone()
        conexao.close()

        if user and user['senha'] == senha:
            session['user'] = user['nome']
            session['id'] = user['id']
            return redirect(url_for('home'))
        else:
            flash('E-mail ou senha incorreto(s)')
            return redirect(url_for('login'))

    return render_template('login.html')


@app.route("/home")
def home():
    if 'user' not in session:
        flash('Por favor, faça login primeiro.')
        return redirect(url_for('login'))
    return render_template('home.html')

@app.route("/descobrir")
def descobrir():
    return render_template("descobrir.html")


@app.route("/meuslivros")
def meuslivros():
    if 'user' not in session:
        return redirect(url_for('login'))
    return render_template("meuslivros.html")


@app.route("/logout")
def logout():
    session.pop('user', None)
    session.pop('id', None)
    flash('Você saiu da sua conta com sucesso!')
    return redirect(url_for('login'))
