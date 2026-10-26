FROM php:8.3-apache
RUN a2enmod rewrite && printf '<Directory /var/www/html>\nAllowOverride All\nOptions -Indexes\nRequire all granted\n</Directory>\n' > /etc/apache2/conf-enabled/findtheweb-qa.conf
COPY seo-qa-apache.sh /usr/local/bin/findtheweb-seo-qa
RUN chmod 755 /usr/local/bin/findtheweb-seo-qa
CMD ["bash", "/usr/local/bin/findtheweb-seo-qa"]
