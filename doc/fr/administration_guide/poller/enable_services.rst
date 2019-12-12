Pour démarrer l'ordonnanceur de supervision :

1. Connectez-vous avec l'utilisateur 'root' sur votre Remote Server
2. Démarrez le composant Centreon Broker ::

    # systemctl start cbd

3. Démarrez Centreon Engine ::

    # systemctl start centengine

4. Démarrez centreon gorgone ::

    # systemctl start centreon-gorgone

5. Démarrez centreontrapd ::

    # systemctl start centreontrapd

Activer le lancement automatique de services au démarrage.

Lancer les commandes suivantes : ::

    # systemctl enable centreon-gorgone
    # systemctl enable centreontrapd
    # systemctl enable cbd
    # systemctl enable centengine
    # systemctl enable centreon
