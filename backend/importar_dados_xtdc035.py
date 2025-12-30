"""
Importa dados extraídos do XTDC035.DAT para o banco de dados
"""
from pathlib import Path
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.cliente import Cliente
from app.models.equipamento import Equipamento, TipoEquipamento
from app.models.motorista import Motorista
from app.models.centro_custo import CentroCusto
import json


def importar_clientes(db: Session, arquivo: Path):
    """Importa clientes do arquivo extraído"""
    print("\nImportando clientes...")

    # Parsear arquivo
    clientes_importados = []
    with open(arquivo, 'r', encoding='utf-8') as f:
        linhas = f.readlines()[3:]  # Pular cabeçalho

        for linha in linhas:
            linha = linha.strip()
            if not linha:
                continue

            partes = linha.split(' - ')
            if len(partes) >= 2:
                nome = partes[0]
                tipo_str = partes[1]  # CLIENTE ou FORNECEDOR (não usado no modelo)

                # Verificar se já existe
                existe = db.query(Cliente).filter(Cliente.nome == nome).first()
                if existe:
                    print(f"  Pulando (já existe): {nome}")
                    continue

                # Gerar CNPJ temporário para importação (assume jurídica)
                import random
                cnpj_temp = f"{random.randint(10000000000000, 99999999999999):014d}"

                # Criar cliente
                cliente = Cliente(
                    nome=nome,
                    tipo_pessoa='J',  # Assume Jurídica
                    cpf_cnpj=cnpj_temp,
                    telefone='',
                    email='',
                    endereco='',
                    cidade='',
                    estado='PE',
                    cep='',
                    ativo=True
                )
                db.add(cliente)
                clientes_importados.append(nome)

    db.commit()
    print(f"OK - {len(clientes_importados)} clientes importados")
    return len(clientes_importados)


def importar_equipamentos(db: Session, arquivo: Path):
    """Importa equipamentos do arquivo extraído"""
    print("\nImportando equipamentos...")

    # Mapear tipos
    tipo_map = {
        'RETROESCAVADEIRA': TipoEquipamento.RETROESCAVADEIRA,
        'ESCAVADEIRA': TipoEquipamento.ESCAVADEIRA,
        'CAMINHAO': TipoEquipamento.CAMINHAO,
        'OUTRO': TipoEquipamento.OUTRO,
    }

    equipamentos_importados = []
    equipamentos_vistos = set()

    with open(arquivo, 'r', encoding='utf-8') as f:
        linhas = f.readlines()[3:]  # Pular cabeçalho

        for linha in linhas:
            linha = linha.strip()
            if not linha:
                continue

            partes = linha.split(' - ')
            if len(partes) >= 2:
                identificacao = partes[0]
                tipo_str = partes[1]

                # Normalizar identificação (evitar duplicatas)
                ident_upper = identificacao.upper()
                if ident_upper in equipamentos_vistos:
                    print(f"  Pulando duplicata: {identificacao}")
                    continue
                equipamentos_vistos.add(ident_upper)

                # Verificar se já existe no banco
                existe = db.query(Equipamento).filter(
                    Equipamento.identificador == identificacao
                ).first()
                if existe:
                    print(f"  Pulando (já existe): {identificacao}")
                    continue

                # Criar equipamento
                tipo_enum = tipo_map.get(tipo_str, TipoEquipamento.OUTRO)
                equipamento = Equipamento(
                    identificador=identificacao,
                    tipo=tipo_enum,
                    marca='N/D',  # Obrigatório
                    modelo='N/D',  # Obrigatório
                    ano_fabricacao=None,
                    placa=None,  # None ao invés de '' para evitar constraint único
                    numero_serie=None,
                    valor_aquisicao=None,
                    hodometro_inicial=None,
                    hodometro_atual=None,
                    ativo=True,
                    observacoes=f'Importado do XTDC035 - {tipo_str}'
                )
                db.add(equipamento)
                equipamentos_importados.append(identificacao)

    db.commit()
    print(f"OK - {len(equipamentos_importados)} equipamentos importados")
    return len(equipamentos_importados)


def importar_motoristas(db: Session, arquivo: Path):
    """Importa motoristas do arquivo extraído"""
    print("\nImportando motoristas...")

    motoristas_importados = []
    motoristas_vistos = set()

    with open(arquivo, 'r', encoding='utf-8') as f:
        linhas = f.readlines()[3:]  # Pular cabeçalho

        for linha in linhas:
            nome = linha.strip()
            if not nome:
                continue

            # Normalizar nome (evitar duplicatas)
            nome_upper = nome.upper()
            if nome_upper in motoristas_vistos:
                print(f"  Pulando duplicata: {nome}")
                continue
            motoristas_vistos.add(nome_upper)

            # Verificar se já existe no banco
            existe = db.query(Motorista).filter(Motorista.nome == nome).first()
            if existe:
                print(f"  Pulando (já existe): {nome}")
                continue

            # Criar motorista
            # Gerar CPF e CNH temporários para importação
            import random
            cpf_temp = f"{random.randint(10000000000, 99999999999):011d}"
            cnh_temp = f"XTDC{random.randint(1000000, 9999999):07d}"

            from datetime import date, timedelta
            validade_temp = date.today() + timedelta(days=365*5)  # 5 anos

            motorista = Motorista(
                nome=nome,
                cpf=cpf_temp,
                cnh=cnh_temp,
                categoria_cnh='D',
                validade_cnh=validade_temp,
                telefone='',
                endereco='',
                data_nascimento=None,
                data_admissao=None,
                ativo=True
            )
            db.add(motorista)
            motoristas_importados.append(nome)

    db.commit()
    print(f"OK - {len(motoristas_importados)} motoristas importados")
    return len(motoristas_importados)


def importar_centros_custo(db: Session, arquivo: Path):
    """Importa centros de custo do arquivo extraído"""
    print("\nImportando centros de custo...")

    centros_importados = []

    with open(arquivo, 'r', encoding='utf-8') as f:
        linhas = f.readlines()[3:]  # Pular cabeçalho

        for linha in linhas:
            linha = linha.strip()
            if not linha:
                continue

            partes = linha.split(' - ', 1)
            if len(partes) >= 2:
                codigo = partes[0]
                descricao = partes[1]

                # Verificar se já existe
                existe = db.query(CentroCusto).filter(
                    CentroCusto.codigo == codigo
                ).first()
                if existe:
                    print(f"  Pulando (já existe): {codigo}")
                    continue

                # Criar centro de custo
                centro = CentroCusto(
                    codigo=codigo,
                    descricao=descricao,
                    ativo=True
                )
                db.add(centro)
                centros_importados.append(codigo)

    db.commit()
    print(f"OK - {len(centros_importados)} centros de custo importados")
    return len(centros_importados)


def main():
    print("=" * 80)
    print("IMPORTACAO DE DADOS DO XTDC035.DAT PARA O BANCO")
    print("=" * 80)

    # Caminhos dos arquivos
    temp_path = Path(__file__).parent / "temp"

    # Criar sessão do banco
    db = SessionLocal()

    try:
        # Importar clientes
        arquivo_clientes = temp_path / "xtdc035_clientes.txt"
        if arquivo_clientes.exists():
            total_clientes = importar_clientes(db, arquivo_clientes)
        else:
            print(f"AVISO: Arquivo não encontrado: {arquivo_clientes}")
            total_clientes = 0

        # Importar equipamentos
        arquivo_equipamentos = temp_path / "xtdc035_equipamentos.txt"
        if arquivo_equipamentos.exists():
            total_equipamentos = importar_equipamentos(db, arquivo_equipamentos)
        else:
            print(f"AVISO: Arquivo não encontrado: {arquivo_equipamentos}")
            total_equipamentos = 0

        # Importar motoristas
        arquivo_motoristas = temp_path / "xtdc035_motoristas.txt"
        if arquivo_motoristas.exists():
            total_motoristas = importar_motoristas(db, arquivo_motoristas)
        else:
            print(f"AVISO: Arquivo não encontrado: {arquivo_motoristas}")
            total_motoristas = 0

        # Importar centros de custo
        arquivo_centros = temp_path / "xtdc035_centros.txt"
        if arquivo_centros.exists():
            total_centros = importar_centros_custo(db, arquivo_centros)
        else:
            print(f"AVISO: Arquivo não encontrado: {arquivo_centros}")
            total_centros = 0

        # Resumo
        print("\n" + "=" * 80)
        print("RESUMO DA IMPORTACAO")
        print("=" * 80)
        print(f"  Clientes:        {total_clientes}")
        print(f"  Equipamentos:    {total_equipamentos}")
        print(f"  Motoristas:      {total_motoristas}")
        print(f"  Centros Custo:   {total_centros}")
        print()
        print("OK - Importacao concluida!")

    except Exception as e:
        print(f"\nERRO durante importacao: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
