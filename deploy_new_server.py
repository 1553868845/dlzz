#!/usr/bin/env python3
"""
部署脚本：上传本地改动到 170.106.153.139 并重建 Docker 镜像
用法: python deploy_new_server.py
"""
import paramiko
import os

HOST = '170.106.153.139'
PORT = 22
USER = 'root'
PASSWORD = 'Ss668668'
REMOTE_BASE = '/opt/qingli-mall'

LOCAL_BASE = r'C:\Users\Mio\Desktop\yijianbushu'


def upload_dir(sftp, local_dir, remote_dir):
    """递归上传整个目录到远程"""
    # 确保远程目录存在
    parts = remote_dir.strip('/').split('/')
    path_so_far = ''
    for part in parts:
        path_so_far += '/' + part
        try:
            sftp.mkdir(path_so_far)
        except Exception:
            pass

    for item in os.listdir(local_dir):
        local_path = os.path.join(local_dir, item)
        remote_path = remote_dir + '/' + item
        if os.path.isdir(local_path):
            upload_dir(sftp, local_path, remote_path)
        else:
            sftp.put(local_path, remote_path)


def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, port=PORT, username=USER, password=PASSWORD, timeout=30)
    sftp = ssh.open_sftp()

    print("SSH 连接成功")

    # 1. 上传 backend/src
    print("上传 backend/src ...")
    upload_dir(sftp, os.path.join(LOCAL_BASE, 'backend/src'), REMOTE_BASE + '/backend/src')

    # 2. 上传 pom.xml
    print("上传 pom.xml ...")
    sftp.put(os.path.join(LOCAL_BASE, 'backend/pom.xml'), REMOTE_BASE + '/backend/pom.xml')

    # 3. 上传 frontend/dist
    print("上传 frontend/dist ...")
    upload_dir(sftp, os.path.join(LOCAL_BASE, 'frontend/dist'), REMOTE_BASE + '/frontend/dist')

    # 4. 上传 Docker 配置
    print("上传 Docker 配置文件 ...")
    sftp.put(os.path.join(LOCAL_BASE, 'frontend.Dockerfile'), REMOTE_BASE + '/frontend.Dockerfile')
    sftp.put(os.path.join(LOCAL_BASE, 'backend.Dockerfile'), REMOTE_BASE + '/backend.Dockerfile')
    sftp.put(os.path.join(LOCAL_BASE, 'docker-compose.yml'), REMOTE_BASE + '/docker-compose.yml')
    sftp.put(os.path.join(LOCAL_BASE, 'nginx/nginx.conf'), REMOTE_BASE + '/nginx/nginx.conf')

    sftp.close()
    print("文件上传完成")

    # 5. 重建镜像
    print("重建 Docker 镜像（backend + nginx）...")
    stdin, stdout, stderr = ssh.exec_command(
        'cd ' + REMOTE_BASE + ' && docker compose build --no-cache backend nginx 2>&1',
        get_pty=True, timeout=600
    )
    for line in stdout:
        print(line.rstrip())

    # 6. 重启容器
    print("重启容器...")
    stdin, stdout, stderr = ssh.exec_command(
        'cd ' + REMOTE_BASE + ' && docker compose up -d',
        get_pty=True
    )
    for line in stdout:
        print(line.rstrip())

    print("部署完成！")
    ssh.close()


if __name__ == '__main__':
    main()
# test
