#!/usr/bin/env node
import path from 'path';
import fs from 'fs-extra';
import Handlebars from 'handlebars';
import { program } from 'commander';

const arquivosFixos = [
	'adlcp_rootv1p2.xsd',
	'ims_xml.xsd',
	'imscp_rootv1p1p2.xsd',
	'imsmd_rootv1p2p1.xsd',
];

const arquivosCompilados = ['imsmanifest.xml', 'index.html'];

const assetsDir = path.resolve(__dirname, '../assets');

async function main() {
	program
		.requiredOption('--cliente <cliente>', 'Nome do cliente. ex.: itau')
		.requiredOption('--curso <curso>', 'Nome do curso. ex.: nome-do-curso')
		.requiredOption(
			'--titulo <titulo>',
			'Título do curso. ex.: Título do Curso'
		)
		.option('--dir <diretorio>', 'Diretório de saída')
		.parse(process.argv);

	const opts = program.opts();
	const cursoIdentifier = `${opts.cliente}_${opts.curso}`.toUpperCase();
	const cursoContent = `${opts.cliente}-${opts.curso}`.toUpperCase();
	const cursoOrganizations = cursoContent.toLowerCase();
	const dir = opts.dir || process.cwd();
	await fs.ensureDir(dir);

	for (const arquivo of arquivosFixos) {
		await fs.copyFile(
			path.resolve(assetsDir, arquivo),
			path.resolve(dir, arquivo)
		);
	}

	for (const arquivo of arquivosCompilados) {
		const conteudo = await fs.readFile(
			path.resolve(assetsDir, arquivo),
			'utf-8'
		);
		const conteudoCompilado = Handlebars.compile(conteudo)({
			cursoIdentifier: cursoIdentifier,
			cursoContent: cursoContent,
			cursoOrganizations: cursoOrganizations,
			cursoTitulo: opts.titulo,
		});

		await fs.writeFile(path.resolve(dir, arquivo), conteudoCompilado);
	}
}

main();
